package email

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"strings"

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

// sendViaSMTP sends email through an SMTP server (such as Gmail STARTTLS on port 587).
func (s *Service) sendViaSMTP(to, subject, htmlBody string) error {
	host := s.cfg.SMTPHost
	if host == "" {
		host = "smtp.gmail.com"
	}
	port := s.cfg.SMTPPort
	if port == "" {
		port = "587"
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

	// Direct SSL on port 465
	if port == "465" {
		tlsConfig := &tls.Config{
			ServerName: host,
		}
		conn, err := tls.Dial("tcp", serverAddr, tlsConfig)
		if err != nil {
			return fmt.Errorf("smtp tls dial: %w", err)
		}
		defer conn.Close()

		c, err := smtp.NewClient(conn, host)
		if err != nil {
			return fmt.Errorf("smtp client: %w", err)
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
	c, err := smtp.Dial(serverAddr)
	if err != nil {
		return fmt.Errorf("smtp dial (%s): %w", serverAddr, err)
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

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: #1E293B; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px; }
    .logo { font-size: 24px; font-weight: 800; color: #10B981; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    p { font-size: 15px; color: #94A3B8; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: inline-block; background: #10B981; color: #0F172A; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍽️ DineFlow</div>
    <h1>Welcome to DineFlow, %s! 🎉</h1>
    <p><strong>%s</strong> is now verified and active. You are on a 14-day Growth trial with unlimited digital menus, KDS, and WhatsApp marketing.</p>
    <a href="%s/dashboard" class="cta">Go to Dashboard →</a>
    <p style="margin-top: 24px; font-size: 13px; color: #64748B;">Questions? Reply directly to this email.</p>
  </div>
</body>
</html>`, name, businessName, appURL)

	subject := fmt.Sprintf("Welcome to DineFlow, %s! Your workspace is ready.", name)
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
