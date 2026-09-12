package email

import (
	"context"
	"fmt"

	"github.com/resend/resend-go/v2"
)

// Service handles sending transactional emails via Resend.
type Service struct {
	client      *resend.Client
	fromAddress string
	fromName    string
	appURL      string
}

// NewService creates an email service connected to Resend.
func NewService(apiKey, fromAddress, fromName, appURL string) *Service {
	return &Service{
		client:      resend.NewClient(apiKey),
		fromAddress: fromAddress,
		fromName:    fromName,
		appURL:      appURL,
	}
}

// from returns the formatted "From" address.
func (s *Service) from() string {
	if s.fromName != "" {
		return fmt.Sprintf("%s <%s>", s.fromName, s.fromAddress)
	}
	return s.fromAddress
}

// SendOTP sends a one-time verification code to a new user.
func (s *Service) SendOTP(ctx context.Context, to, name, code string) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0A0A0F; color: #F1F0FF; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; }
    .logo { font-size: 24px; font-weight: 800; color: #F25C1A; margin-bottom: 32px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    p { font-size: 15px; color: #A09DB8; line-height: 1.6; margin: 0 0 24px; }
    .otp { font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 700; letter-spacing: 0.15em; color: #F25C1A; background: rgba(242,92,26,0.1); border: 1px solid rgba(242,92,26,0.2); border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .footer { font-size: 12px; color: #6B6883; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">DineFlow</div>
    <h1>Verify your email</h1>
    <p>Hi %s, welcome to DineFlow! Enter this code to verify your email and activate your account.</p>
    <div class="otp">%s</div>
    <p>This code expires in <strong>10 minutes</strong>. If you didn't create a DineFlow account, you can safely ignore this email.</p>
    <div class="footer">© 2026 DineFlow. The operating system for hospitality.</div>
  </div>
</body>
</html>`, name, code)

	params := &resend.SendEmailRequest{
		From:    s.from(),
		To:      []string{to},
		Subject: fmt.Sprintf("%s is your DineFlow verification code", code),
		Html:    html,
	}

	_, err := s.client.Emails.SendWithContext(ctx, params)
	if err != nil {
		return fmt.Errorf("email: send otp: %w", err)
	}
	return nil
}

// SendWelcome sends a welcome email after successful account activation.
func (s *Service) SendWelcome(ctx context.Context, to, name, businessName string) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0A0A0F; color: #F1F0FF; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; }
    .logo { font-size: 24px; font-weight: 800; color: #F25C1A; margin-bottom: 32px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    p { font-size: 15px; color: #A09DB8; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: inline-block; background: #F25C1A; color: #fff; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">DineFlow</div>
    <h1>Welcome to DineFlow, %s! 🎉</h1>
    <p><strong>%s</strong> is now live on DineFlow. You're on a 14-day Growth trial — no credit card needed.</p>
    <p>Here's what to do next:</p>
    <p>1. Add your menu items<br>2. Set up your tables<br>3. Download your QR codes<br>4. Share with your customers</p>
    <a href="%s/dashboard" class="cta">Go to Dashboard →</a>
    <p style="margin-top: 24px;">Questions? Reply to this email — we read every message.</p>
  </div>
</body>
</html>`, name, businessName, s.appURL)

	params := &resend.SendEmailRequest{
		From:    s.from(),
		To:      []string{to},
		Subject: fmt.Sprintf("Welcome to DineFlow, %s! Your 14-day trial starts now.", name),
		Html:    html,
	}

	_, err := s.client.Emails.SendWithContext(ctx, params)
	if err != nil {
		return fmt.Errorf("email: send welcome: %w", err)
	}
	return nil
}

// SendPasswordReset sends a password reset link.
func (s *Service) SendPasswordReset(ctx context.Context, to, name, resetLink string) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Inter, sans-serif; background: #0A0A0F; color: #F1F0FF; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; }
    .logo { font-size: 24px; font-weight: 800; color: #F25C1A; margin-bottom: 32px; }
    p { font-size: 15px; color: #A09DB8; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: inline-block; background: #F25C1A; color: #fff; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">DineFlow</div>
    <p>Hi %s, we received a request to reset your DineFlow password. Click the button below — this link expires in 1 hour.</p>
    <a href="%s" class="cta">Reset Password</a>
    <p style="margin-top: 24px; font-size: 13px;">If you didn't request this, please ignore this email. Your password will not be changed.</p>
  </div>
</body>
</html>`, name, resetLink)

	params := &resend.SendEmailRequest{
		From:    s.from(),
		To:      []string{to},
		Subject: "Reset your DineFlow password",
		Html:    html,
	}

	_, err := s.client.Emails.SendWithContext(ctx, params)
	return err
}

// SendInvite sends a staff invitation email.
func (s *Service) SendInvite(ctx context.Context, to, inviterName, businessName, inviteLink string) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Inter, sans-serif; background: #0A0A0F; color: #F1F0FF; margin: 0; padding: 40px 20px; }
    .card { max-width: 480px; margin: 0 auto; background: #111118; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px; }
    .logo { font-size: 24px; font-weight: 800; color: #F25C1A; margin-bottom: 32px; }
    p { font-size: 15px; color: #A09DB8; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: inline-block; background: #F25C1A; color: #fff; font-weight: 600; padding: 14px 28px; border-radius: 10px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">DineFlow</div>
    <p><strong>%s</strong> has invited you to join <strong>%s</strong> on DineFlow.</p>
    <p>DineFlow is how modern restaurants manage orders, menus, and teams — all in one place.</p>
    <a href="%s" class="cta">Accept Invitation →</a>
    <p style="margin-top: 24px; font-size: 13px;">This invite expires in 48 hours.</p>
  </div>
</body>
</html>`, inviterName, businessName, inviteLink)

	params := &resend.SendEmailRequest{
		From:    s.from(),
		To:      []string{to},
		Subject: fmt.Sprintf("You've been invited to join %s on DineFlow", businessName),
		Html:    html,
	}

	_, err := s.client.Emails.SendWithContext(ctx, params)
	return err
}
