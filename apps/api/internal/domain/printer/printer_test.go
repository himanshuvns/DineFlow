package printer

import (
	"strings"
	"testing"
	"time"
)

func TestGenerateKOTText(t *testing.T) {
	data := KOTData{
		RestaurantName: "The Grand Bistro",
		StationName:    "Main Kitchen",
		LocationName:   "Table 14",
		OrderNumber:    "ORD-209",
		CreatedAt:      time.Now(),
		Items: []KOTItem{
			{Quantity: 2, Name: "Truffle Risotto", Notes: "Extra parmesan"},
			{Quantity: 1, Name: "Cold Brew Tonic"},
		},
		SpecialNotes: "Guest allergic to peanuts",
	}

	text := GenerateKOTText(data, Width80mm)

	if !strings.Contains(text, "KOT: MAIN KITCHEN") {
		t.Errorf("expected station header in KOT text, got: %s", text)
	}
	if !strings.Contains(text, "TABLE 14") {
		t.Errorf("expected location in KOT text")
	}
	if !strings.Contains(text, "Truffle Risotto") {
		t.Errorf("expected item name in KOT text")
	}
	if !strings.Contains(text, "Extra parmesan") {
		t.Errorf("expected item notes in KOT text")
	}
	if !strings.Contains(text, "Guest allergic to peanuts") {
		t.Errorf("expected special notes in KOT text")
	}
}

func TestGenerateBillText(t *testing.T) {
	data := BillData{
		RestaurantName: "The Grand Bistro",
		Address:        "Colaba Causeway, Mumbai",
		GSTIN:          "27AABCU9603R1ZM",
		LocationName:   "Suite 302",
		BillNumber:     "BILL-8092",
		Date:           time.Now(),
		Items: []BillItem{
			{Quantity: 1, Name: "Grand Club Sandwich", UnitPrice: 650, Total: 650},
			{Quantity: 1, Name: "Atlantic Salmon", UnitPrice: 1200, Total: 1200},
		},
		Subtotal:   1850.00,
		CGST:       46.25,
		SGST:       46.25,
		ServiceFee: 150.00,
		GrandTotal: 2092.50,
	}

	text := GenerateBillText(data, Width80mm)

	if !strings.Contains(text, "BILL NO:  BILL-8092") {
		t.Errorf("expected bill number in text")
	}
	if !strings.Contains(text, "GSTIN: 27AABCU9603R1ZM") {
		t.Errorf("expected GSTIN in text")
	}
	if !strings.Contains(text, "2092.50") {
		t.Errorf("expected grand total in text")
	}
}
