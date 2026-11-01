package email

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"strings"
	"time"

	"github.com/resend/resend-go/v2"
)

// Config holds email transport settings.
type Config struct {
	Provider     string // "smtp" or "resend"
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPass     string
	ResendAPIKey string
	FromAddress  string
	FromName     string
	AppURL       string
}

// Service handles sending transactional emails via standard SMTP (Gmail) or Resend.
type Service struct {
	cfg          Config
	resendClient *resend.Client
}

// NewService creates an email service configured with SMTP and/or Resend.
func NewService(cfg Config) *Service {
	var client *resend.Client
	if cfg.ResendAPIKey != "" && cfg.ResendAPIKey != "re_REPLACE_ME" {
		client = resend.NewClient(cfg.ResendAPIKey)
	}

	fromAddr := cfg.FromAddress
	if fromAddr == "" {
		if cfg.SMTPUser != "" {
			fromAddr = cfg.SMTPUser
		} else {
			fromAddr = "dineflowtech@gmail.com"
		}
	}

	fromName := cfg.FromName
	if fromName == "" {
		fromName = "DineFlow"
	}

	cfg.FromAddress = fromAddr
	cfg.FromName = fromName

	return &Service{
		cfg:          cfg,
		resendClient: client,
	}
}

// NewLegacyService maintains backwards compatibility with previous constructor.
func NewLegacyService(apiKey, fromAddress, fromName, appURL string) *Service {
	return NewService(Config{
		ResendAPIKey: apiKey,
		FromAddress:  fromAddress,
		FromName:     fromName,
		AppURL:       appURL,
	})
}

// from returns the formatted "From" header.
func (s *Service) from() string {
	if s.cfg.FromName != "" {
		return fmt.Sprintf("%s <%s>", s.cfg.FromName, s.cfg.FromAddress)
	}
	return s.cfg.FromAddress
}

// sendViaSMTP sends email through an SMTP server (defaults to Gmail STARTTLS on port 587, with automatic fallback to port 465 SSL).
func (s *Service) sendViaSMTP(to, subject, htmlBody string) error {
	port := s.cfg.SMTPPort
	if port == "" {
		port = "587"
	}

	err := s.sendViaPort(to, subject, htmlBody, port)
	if err == nil {
		return nil
	}

	// If initial attempt on port 587 failed, automatically retry via port 465 SSL
	if port == "587" {
		log.Printf("⚠️ [EMAIL SMTP] Port 587 attempt failed: %v. Retrying via SSL port 465...", err)
		if err465 := s.sendViaPort(to, subject, htmlBody, "465"); err465 == nil {
			log.Printf("📧 [EMAIL SMTP] Dispatched to %s via fallback SSL port 465", to)
			return nil
		}
	} else if port == "465" {
		log.Printf("⚠️ [EMAIL SMTP] Port 465 attempt failed: %v. Retrying via STARTTLS port 587...", err)
		if err587 := s.sendViaPort(to, subject, htmlBody, "587"); err587 == nil {
			log.Printf("📧 [EMAIL SMTP] Dispatched to %s via fallback STARTTLS port 587", to)
			return nil
		}
	}

	return err
}

func (s *Service) sendViaPort(to, subject, htmlBody, port string) error {
	host := s.cfg.SMTPHost
	if host == "" {
		host = "smtp.gmail.com"
	}
	serverAddr := net.JoinHostPort(host, port)

	auth := smtp.PlainAuth("", s.cfg.SMTPUser, s.cfg.SMTPPass, host)

	headers := make(map[string]string)
	headers["From"] = s.from()
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	dialer := &net.Dialer{Timeout: 10 * time.Second}

	// Direct SSL on port 465
	if port == "465" {
		tlsConfig := &tls.Config{
			ServerName: host,
		}
		conn, err := tls.DialWithDialer(dialer, "tcp", serverAddr, tlsConfig)
		if err != nil {
			return fmt.Errorf("smtp tls dial (%s): %w", serverAddr, err)
		}
		defer conn.Close()

		c, err := smtp.NewClient(conn, host)
		if err != nil {
			return fmt.Errorf("smtp client (%s): %w", host, err)
		}
		defer c.Quit()

		if err = c.Auth(auth); err != nil {
			return fmt.Errorf("smtp auth: %w", err)
		}
		if err = c.Mail(s.cfg.FromAddress); err != nil {
			return fmt.Errorf("smtp mail from: %w", err)
		}
		if err = c.Rcpt(to); err != nil {
			return fmt.Errorf("smtp rcpt to: %w", err)
		}
		w, err := c.Data()
		if err != nil {
			return fmt.Errorf("smtp data: %w", err)
		}
		_, err = w.Write([]byte(msg.String()))
		if err != nil {
			return fmt.Errorf("smtp write: %w", err)
		}
		return w.Close()
	}

	// Port 587 (Standard STARTTLS for Gmail)
	conn, err := dialer.Dial("tcp", serverAddr)
	if err != nil {
		return fmt.Errorf("smtp dial (%s): %w", serverAddr, err)
	}
	defer conn.Close()

	c, err := smtp.NewClient(conn, host)
	if err != nil {
		return fmt.Errorf("smtp client (%s): %w", host, err)
	}
	defer c.Quit()

	tlsConfig := &tls.Config{
		ServerName: host,
	}
	if ok, _ := c.Extension("STARTTLS"); ok {
		if err = c.StartTLS(tlsConfig); err != nil {
			return fmt.Errorf("smtp starttls: %w", err)
		}
	}

	if auth != nil {
		if ok, _ := c.Extension("AUTH"); ok {
			if err = c.Auth(auth); err != nil {
				return fmt.Errorf("smtp auth: %w", err)
			}
		}
	}

	if err = c.Mail(s.cfg.FromAddress); err != nil {
		return fmt.Errorf("smtp mail from: %w", err)
	}
	if err = c.Rcpt(to); err != nil {
		return fmt.Errorf("smtp rcpt to: %w", err)
	}

	w, err := c.Data()
	if err != nil {
		return fmt.Errorf("smtp data: %w", err)
	}
	_, err = w.Write([]byte(msg.String()))
	if err != nil {
		return fmt.Errorf("smtp write: %w", err)
	}
	return w.Close()
}

// sendEmail delivers the email via SMTP if configured, or falls back to Resend / local log.
func (s *Service) sendEmail(ctx context.Context, to, subject, htmlBody string) error {
	// 1. Prioritize SMTP (Gmail)
	if s.cfg.SMTPHost != "" && s.cfg.SMTPUser != "" && s.cfg.SMTPPass != "" {
		err := s.sendViaSMTP(to, subject, htmlBody)
		if err != nil {
			log.Printf("❌ [EMAIL SMTP] Failed to send to %s via %s: %v", to, s.cfg.SMTPHost, err)
			return err
		}
		log.Printf("📧 [EMAIL SMTP] Dispatched to %s from %s", to, s.from())
		return nil
	}

	// 2. Resend API
	if s.resendClient != nil && s.cfg.ResendAPIKey != "" && s.cfg.ResendAPIKey != "re_REPLACE_ME" {
		params := &resend.SendEmailRequest{
			From:    s.from(),
			To:      []string{to},
			Subject: subject,
			Html:    htmlBody,
		}
		_, err := s.resendClient.Emails.SendWithContext(ctx, params)
		if err != nil {
			log.Printf("❌ [EMAIL RESEND] Failed to send to %s: %v", to, err)
			return fmt.Errorf("resend: %w", err)
		}
		log.Printf("📧 [EMAIL RESEND] Dispatched to %s", to)
		return nil
	}

	// 3. Dev mode fallback log
	log.Printf("⚠️ [EMAIL SIMULATION] Outbound to: %s | Subject: %s", to, subject)
	return nil
}

// SendOTP sends a 6-digit one-time verification code to a user's email.
func (s *Service) SendOTP(ctx context.Context, to, name, code string) error {
	greetingName := name
	if greetingName == "" {
		greetingName = "there"
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 16px; }
    .container { max-width: 480px; margin: 0 auto; background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .brand-name { font-size: 22px; font-weight: 800; color: #10B981; letter-spacing: -0.5px; }
    h1 { font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 20px 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #94A3B8; margin: 0 0 20px 0; }
    .otp-card { background: rgba(16, 185, 129, 0.08); border: 1.5px dashed #10B981; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #10B981; margin: 0; }
    .otp-meta { font-size: 12px; color: #64748B; margin-top: 8px; }
    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; font-size: 11px; color: #64748B; text-align: center; line-height: 1.5; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="container">
    <div>
      <span class="brand-name">🍽️ DineFlow</span>
    </div>
    <h1>Verify your work email</h1>
    <p>Hi %s, welcome to DineFlow! Enter the 6-digit verification code below to verify your email and activate your workspace:</p>
    
    <div class="otp-card">
      <div class="otp-code">%s</div>
      <div class="otp-meta">Valid for 10 minutes • Keep this code private</div>
    </div>
    
    <p>If you did not register for a DineFlow account, you can safely ignore this email.</p>
    
    <div class="footer">
      Sent securely by DineFlow Hospitality OS.<br>
      © 2026 DineFlow. All rights reserved.
    </div>
  </div>
</body>
</html>`, greetingName, code)

	subject := fmt.Sprintf("%s is your DineFlow verification code", code)
	return s.sendEmail(ctx, to, subject, html)
}

// SendWelcome sends a welcome email after successful account activation.
func (s *Service) SendWelcome(ctx context.Context, to, name, businessName string) error {
	appURL := s.cfg.AppURL
	if appURL == "" {
		appURL = "https://dine.rovixatech.com"
	}
	trialExpiryDate := time.Now().Add(14 * 24 * time.Hour).Format("02 Jan 2006")

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 16px; }
    .card { max-width: 520px; margin: 0 auto; background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .logo { font-size: 24px; font-weight: 800; color: #10B981; margin-bottom: 20px; }
    .badge { display: inline-block; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px; }
    p { font-size: 14px; color: #94A3B8; line-height: 1.6; margin: 0 0 16px; }
    .features-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
    .feature-item { font-size: 13px; color: #E2E8F0; margin: 8px 0; }
    .feature-item span { color: #10B981; font-weight: bold; margin-right: 8px; }
    .cta { display: inline-block; background: #10B981; color: #0F172A; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 16px 0; }
    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; font-size: 11px; color: #64748B; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍽️ DineFlow</div>
    <div class="badge">✨ 14-Day Free Starter Trial Active</div>
    <h1>Welcome to DineFlow, %s! 🎉</h1>
    <p>Your restaurant workspace <strong>%s</strong> is now verified and ready. You have full access to DineFlow's Starter plan free of charge until <strong>%s</strong>.</p>
    
    <div class="features-box">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8; margin-bottom: 12px;">What is included in your Starter Trial:</div>
      <div class="feature-item"><span>✓</span> 10 Tables with instant QR ordering</div>
      <div class="feature-item"><span>✓</span> Up to 100 Menu Items with photos & variants</div>
      <div class="feature-item"><span>✓</span> 5 Staff user logins (Waiters, Kitchen, Cashier)</div>
      <div class="feature-item"><span>✓</span> Real-time Kitchen Display Screen (KDS)</div>
      <div class="feature-item"><span>✓</span> Automated WhatsApp guest alerts</div>
    </div>

    <a href="%s/dashboard" class="cta">Launch Workspace Dashboard →</a>

    <p style="margin-top: 16px; font-size: 13px; color: #64748B;">
      No credit card was charged. We will remind you 7 days before your trial ends so your operations continue seamlessly.
    </p>

    <div class="footer">
      Sent with care by DineFlow Hospitality OS.<br>
      © 2026 DineFlow. All rights reserved.
    </div>
  </div>
</body>
</html>`, name, businessName, trialExpiryDate, appURL)

	subject := fmt.Sprintf("Welcome to DineFlow! Your 14-day Starter trial for %s is active", businessName)
	return s.sendEmail(ctx, to, subject, html)
}

// SendTrialExpiryWarning sends a daily notification when the trial is within 7 days of expiry.
func (s *Service) SendTrialExpiryWarning(ctx context.Context, to, name, businessName string, daysRemaining int, upgradeLink string) error {
	if upgradeLink == "" {
		upgradeLink = "https://dine.rovixatech.com/dashboard/settings?tab=billing"
	}

	badgeColor := "#F59E0B" // Amber default
	badgeBg := "rgba(245, 158, 11, 0.12)"
	badgeBorder := "rgba(245, 158, 11, 0.3)"
	badgeText := fmt.Sprintf("⏳ %d Days Remaining in Free Trial", daysRemaining)
	subject := fmt.Sprintf("⏳ %d Days Left: Renew your DineFlow trial for %s", daysRemaining, businessName)

	if daysRemaining <= 1 {
		badgeColor = "#EF4444" // Urgent Red
		badgeBg = "rgba(239, 68, 68, 0.15)"
		badgeBorder = "rgba(239, 68, 68, 0.35)"
		badgeText = "🚨 Urgent: Trial Ends Tomorrow!"
		subject = fmt.Sprintf("🚨 Urgent: Your DineFlow trial for %s ends tomorrow — upgrade now", businessName)
	} else if daysRemaining <= 3 {
		badgeColor = "#F97316" // Orange
		badgeBg = "rgba(249, 115, 22, 0.12)"
		badgeBorder = "rgba(249, 115, 22, 0.3)"
		badgeText = fmt.Sprintf("⚠️ Only %d Days Left in Free Trial", daysRemaining)
		subject = fmt.Sprintf("⚠️ %d Days Left: Keep %s running smoothly without interruption", daysRemaining, businessName)
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 16px; }
    .card { max-width: 520px; margin: 0 auto; background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .logo { font-size: 24px; font-weight: 800; color: #10B981; margin-bottom: 20px; }
    .badge { display: inline-block; background: %s; border: 1px solid %s; color: %s; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px; }
    p { font-size: 14px; color: #94A3B8; line-height: 1.6; margin: 0 0 16px; }
    .plan-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px 20px; margin: 20px 0; }
    .plan-title { font-size: 15px; font-weight: 700; color: #FFFFFF; margin-bottom: 6px; }
    .plan-price { font-size: 20px; font-weight: 800; color: #10B981; margin-bottom: 12px; }
    .plan-features { font-size: 13px; color: #CBD5E1; line-height: 1.6; }
    .cta { display: inline-block; background: #10B981; color: #0F172A; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 16px 0; }
    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; font-size: 11px; color: #64748B; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍽️ DineFlow</div>
    <div class="badge">%s</div>
    <h1>Don't let your restaurant pause, %s!</h1>
    <p>Your 14-day Starter trial for <strong>%s</strong> expires in <strong>%d days</strong>. To ensure zero disruption for your kitchen orders, live QR menus, and staff operations, choose your plan before the trial ends.</p>
    
    <div class="plan-box">
      <div class="plan-title">Starter Plan (Recommended for single outlet)</div>
      <div class="plan-price">₹999 / month <span style="font-size: 12px; color: #94A3B8; font-weight: normal;">(₹799/mo billed annually)</span></div>
      <div class="plan-features">
        ✓ 10 Tables & live QR code ordering<br>
        ✓ 100 Menu items & dish customization<br>
        ✓ 5 Staff accounts & role permissions<br>
        ✓ Kitchen Display System (KDS)<br>
        ✓ WhatsApp order notifications
      </div>
    </div>

    <a href="%s" class="cta">Renew / Upgrade Workspace Plan →</a>

    <p style="margin-top: 16px; font-size: 13px; color: #64748B;">
      Need larger capacity? Growth Pro (50 tables, unlimited dishes) is also available in your billing dashboard.
    </p>

    <div class="footer">
      Sent by DineFlow Hospitality OS.<br>
      Questions? Reach our team anytime at dineflowtech@gmail.com
    </div>
  </div>
</body>
</html>`, badgeBg, badgeBorder, badgeColor, badgeText, name, businessName, daysRemaining, upgradeLink)

	return s.sendEmail(ctx, to, subject, html)
}

// SendTrialExpired notifies the customer that their trial has expired and offers 1-click renewal.
func (s *Service) SendTrialExpired(ctx context.Context, to, name, businessName, upgradeLink string) error {
	if upgradeLink == "" {
		upgradeLink = "https://dine.rovixatech.com/dashboard/settings?tab=billing"
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 16px; }
    .card { max-width: 520px; margin: 0 auto; background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .logo { font-size: 24px; font-weight: 800; color: #10B981; margin-bottom: 20px; }
    .badge { display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #EF4444; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px; }
    p { font-size: 14px; color: #94A3B8; line-height: 1.6; margin: 0 0 16px; }
    .preserve-box { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0; }
    .cta { display: inline-block; background: #10B981; color: #0F172A; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 16px 0; }
    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; font-size: 11px; color: #64748B; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍽️ DineFlow</div>
    <div class="badge">⚠️ Trial Period Ended</div>
    <h1>Your DineFlow trial has expired, %s</h1>
    <p>The 14-day Starter trial for <strong>%s</strong> has ended. Active order placements and kitchen display streams are currently paused.</p>
    
    <div class="preserve-box">
      <div style="font-size: 13px; font-weight: 700; color: #10B981; margin-bottom: 6px;">🔒 Your data is 100%% safe & preserved:</div>
      <div style="font-size: 13px; color: #CBD5E1; line-height: 1.5;">
        Your menu items, floor layouts, QR codes, staff settings, and sales analytics are preserved under your 14-day protection grace period.
      </div>
    </div>

    <a href="%s" class="cta">Reactivate Workspace Now →</a>

    <p style="margin-top: 16px; font-size: 13px; color: #64748B;">
      Choose Starter (₹999/mo) or Growth Pro (₹2,999/mo) to restore instant live operations.
    </p>

    <div class="footer">
      Sent by DineFlow Hospitality OS.<br>
      © 2026 DineFlow. All rights reserved.
    </div>
  </div>
</body>
</html>`, name, businessName, upgradeLink)

	subject := fmt.Sprintf("🚨 Action Required: Reactivate your DineFlow workspace for %s", businessName)
	return s.sendEmail(ctx, to, subject, html)
}

// SendPlanUpgradeConfirmation sends a confirmation receipt upon plan upgrade or renewal.
func (s *Service) SendPlanUpgradeConfirmation(ctx context.Context, to, name, businessName, planTier, cycle string, price float64, renewalDate time.Time, invoiceNumber string) error {
	appURL := s.cfg.AppURL
	if appURL == "" {
		appURL = "https://dine.rovixatech.com"
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 16px; }
    .card { max-width: 520px; margin: 0 auto; background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .logo { font-size: 24px; font-weight: 800; color: #10B981; margin-bottom: 20px; }
    .badge { display: inline-block; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px; }
    p { font-size: 14px; color: #94A3B8; line-height: 1.6; margin: 0 0 16px; }
    .receipt-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .receipt-row:last-child { border-bottom: none; font-weight: 700; font-size: 15px; color: #FFFFFF; padding-top: 12px; }
    .receipt-label { color: #94A3B8; }
    .receipt-value { color: #E2E8F0; text-align: right; }
    .cta { display: inline-block; background: #10B981; color: #0F172A; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 16px 0; }
    .footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; font-size: 11px; color: #64748B; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍽️ DineFlow</div>
    <div class="badge">🎉 Plan Confirmed & Active</div>
    <h1>Thank you for your business, %s!</h1>
    <p>Your subscription for <strong>%s</strong> has been successfully activated. Here is your receipt summary:</p>
    
    <div class="receipt-box">
      <div class="receipt-row">
        <span class="receipt-label">Plan Tier</span>
        <span class="receipt-value" style="text-transform: capitalize; font-weight: bold; color: #10B981;">%s</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Billing Cycle</span>
        <span class="receipt-value" style="text-transform: capitalize;">%s</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Invoice Reference</span>
        <span class="receipt-value">%s</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Next Renewal Date</span>
        <span class="receipt-value">%s</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Total Amount</span>
        <span class="receipt-value" style="color: #10B981;">₹%.2f</span>
      </div>
    </div>

    <a href="%s/dashboard" class="cta">Open Workspace Dashboard →</a>

    <div class="footer">
      Sent with gratitude by DineFlow Hospitality OS.<br>
      © 2026 DineFlow. All rights reserved.
    </div>
  </div>
</body>
</html>`, name, businessName, planTier, cycle, invoiceNumber, renewalDate.Format("02 Jan 2006"), price, appURL)

	subject := fmt.Sprintf("🎉 DineFlow Confirmation: %s plan activated for %s", planTier, businessName)
	return s.sendEmail(ctx, to, subject, html)
}

// SendPasswordReset sends a password reset link.
func (s *Service) SendPasswordReset(ctx context.Context, to, name, resetLink string) error {
	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Inter, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px; }
    .logo { font-size: 24px; font-weight: 800; color: #10B981; margin-bottom: 24px; }
    p { font-size: 15px; color: #94A3B8; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: inline-block; background: #10B981; color: #0F172A; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍽️ DineFlow</div>
    <p>Hi %s, we received a request to reset your DineFlow password. Click the button below — this link expires in 1 hour.</p>
    <a href="%s" class="cta">Reset Password</a>
    <p style="margin-top: 24px; font-size: 13px; color: #64748B;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
  </div>
</body>
</html>`, name, resetLink)

	subject := "Reset your DineFlow password"
	return s.sendEmail(ctx, to, subject, html)
}

// SendInvite sends a staff invitation email.
func (s *Service) SendInvite(ctx context.Context, to, inviterName, businessName, inviteLink string) error {
	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Inter, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px; }
    .logo { font-size: 24px; font-weight: 800; color: #10B981; margin-bottom: 24px; }
    p { font-size: 15px; color: #94A3B8; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: inline-block; background: #10B981; color: #0F172A; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍽️ DineFlow</div>
    <p><strong>%s</strong> has invited you to join <strong>%s</strong> on DineFlow.</p>
    <p>DineFlow is the modern restaurant & hotel operating system for menus, orders, and teams.</p>
    <a href="%s" class="cta">Accept Invitation →</a>
    <p style="margin-top: 24px; font-size: 13px; color: #64748B;">This invitation expires in 48 hours.</p>
  </div>
</body>
</html>`, inviterName, businessName, inviteLink)

	subject := fmt.Sprintf("You've been invited to join %s on DineFlow", businessName)
	return s.sendEmail(ctx, to, subject, html)
}
