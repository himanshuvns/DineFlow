package printer

import (
	"fmt"
	"strings"
	"time"
)

type PrinterWidth int

const (
	Width80mm PrinterWidth = 48
	Width58mm PrinterWidth = 32
)

type KOTItem struct {
	Quantity int
	Name     string
	Notes    string
}

type KOTData struct {
	RestaurantName string
	StationName    string
	LocationName   string // e.g. "Table 4" or "Suite 302"
	OrderNumber    string
	CreatedAt      time.Time
	Items          []KOTItem
	SpecialNotes   string
}

// GenerateKOTText generates clean monospaced ASCII text for thermal KOT printers.
func GenerateKOTText(data KOTData, width PrinterWidth) string {
	w := int(width)
	line := strings.Repeat("-", w)
	doubleLine := strings.Repeat("=", w)

	var b strings.Builder

	// Header
	b.WriteString(centerText(doubleLine, w) + "\n")
	b.WriteString(centerText(strings.ToUpper(data.RestaurantName), w) + "\n")
	b.WriteString(centerText(fmt.Sprintf("** KOT: %s **", strings.ToUpper(data.StationName)), w) + "\n")
	b.WriteString(centerText(doubleLine, w) + "\n")

	// Metadata
	b.WriteString(fmt.Sprintf("LOCATION: %s\n", strings.ToUpper(data.LocationName)))
	b.WriteString(fmt.Sprintf("ORDER #:  %s\n", data.OrderNumber))
	b.WriteString(fmt.Sprintf("TIME:     %s\n", data.CreatedAt.Format("02 Jan 15:04:05")))
	b.WriteString(line + "\n")

	// Table Header
	b.WriteString(padRow("QTY", "ITEM DESCRIPTION", w) + "\n")
	b.WriteString(line + "\n")

	// Items
	for _, it := range data.Items {
		qtyStr := fmt.Sprintf("%2dx", it.Quantity)
		b.WriteString(padRow(qtyStr, it.Name, w) + "\n")
		if it.Notes != "" {
			b.WriteString(fmt.Sprintf("    >> NOTE: %s\n", it.Notes))
		}
	}
	b.WriteString(line + "\n")

	// Special instructions
	if data.SpecialNotes != "" {
		b.WriteString(fmt.Sprintf("INSTRUCTIONS: %s\n", data.SpecialNotes))
		b.WriteString(line + "\n")
	}

	b.WriteString(centerText("[ END OF TICKET ]", w) + "\n\n\n")
	return b.String()
}

type BillItem struct {
	Quantity int
	Name     string
	UnitPrice float64
	Total    float64
}

type BillData struct {
	RestaurantName string
	Address        string
	GSTIN          string
	LocationName   string
	BillNumber     string
	Date           time.Time
	Items          []BillItem
	Subtotal       float64
	CGST           float64
	SGST           float64
	ServiceFee     float64
	GrandTotal     float64
}

// GenerateBillText generates a formatted guest tax receipt for 80mm/58mm printers.
func GenerateBillText(data BillData, width PrinterWidth) string {
	w := int(width)
	line := strings.Repeat("-", w)
	doubleLine := strings.Repeat("=", w)

	var b strings.Builder

	b.WriteString(centerText(strings.ToUpper(data.RestaurantName), w) + "\n")
	if data.Address != "" {
		b.WriteString(centerText(data.Address, w) + "\n")
	}
	if data.GSTIN != "" {
		b.WriteString(centerText("GSTIN: "+data.GSTIN, w) + "\n")
	}
	b.WriteString(doubleLine + "\n")

	b.WriteString(fmt.Sprintf("BILL NO:  %s\n", data.BillNumber))
	b.WriteString(fmt.Sprintf("TABLE/RM: %s\n", data.LocationName))
	b.WriteString(fmt.Sprintf("DATE:     %s\n", data.Date.Format("02 Jan 2006 15:04")))
	b.WriteString(line + "\n")

	// Columns
	b.WriteString(fmt.Sprintf("%-24s %6s %10s\n", "ITEM", "QTY", "AMOUNT"))
	b.WriteString(line + "\n")

	for _, it := range data.Items {
		itemLine := fmt.Sprintf("%-24s %6d %10.2f", truncate(it.Name, 24), it.Quantity, it.Total)
		b.WriteString(itemLine + "\n")
	}
	b.WriteString(line + "\n")

	b.WriteString(fmt.Sprintf("%-30s %10.2f\n", "Subtotal:", data.Subtotal))
	b.WriteString(fmt.Sprintf("%-30s %10.2f\n", "CGST (2.5%):", data.CGST))
	b.WriteString(fmt.Sprintf("%-30s %10.2f\n", "SGST (2.5%):", data.SGST))
	if data.ServiceFee > 0 {
		b.WriteString(fmt.Sprintf("%-30s %10.2f\n", "Room Delivery Charge:", data.ServiceFee))
	}
	b.WriteString(doubleLine + "\n")
	b.WriteString(fmt.Sprintf("%-30s %10.2f\n", "GRAND TOTAL (INR):", data.GrandTotal))
	b.WriteString(doubleLine + "\n")

	b.WriteString(centerText("Thank you for dining with us!", w) + "\n")
	b.WriteString(centerText("Scan QR on stand to reorder", w) + "\n\n\n")

	return b.String()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func centerText(s string, width int) string {
	if len(s) >= width {
		return s[:width]
	}
	pad := (width - len(s)) / 2
	return strings.Repeat(" ", pad) + s
}

func padRow(left, right string, width int) string {
	available := width - len(left) - 2
	if available < 0 {
		available = 1
	}
	return fmt.Sprintf("%s  %-*s", left, available, right)
}

func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max-1] + "…"
	}
	return s
}
