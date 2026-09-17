package search

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"sync"
	"time"

	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type SearchResultItem struct {
	ID        string                 `json:"id"`
	Title     string                 `json:"title"`
	Subtitle  string                 `json:"subtitle"`
	Category  string                 `json:"category"` // "menu", "orders", "rooms", "customers", "tables", "staff", "categories"
	Badge     string                 `json:"badge,omitempty"`
	ActionURL string                 `json:"actionUrl"`
	Icon      string                 `json:"icon,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

type SearchResultsGrouped struct {
	Menu       []SearchResultItem `json:"menu"`
	Orders     []SearchResultItem `json:"orders"`
	Rooms      []SearchResultItem `json:"rooms"`
	Customers  []SearchResultItem `json:"customers"`
	Tables     []SearchResultItem `json:"tables"`
	Staff      []SearchResultItem `json:"staff"`
	Categories []SearchResultItem `json:"categories"`
}

type SearchResponse struct {
	Query   string               `json:"query"`
	Results SearchResultsGrouped `json:"results"`
	Total   int                  `json:"total"`
}

type SearchFilterOptions struct {
	Category string `json:"category"` // "all", "menu", "orders", "rooms", "tables", "customers", "guests", "reservations", "staff", "categories", "payments"
	Status   string `json:"status"`   // "all", "pending", "preparing", "delivered", "occupied", "vacant", "reserved"
	Type     string `json:"type"`     // "all", "veg", "non_veg"
	Date     string `json:"date"`     // "all", "today", "yesterday", "week", "month"
	Sort     string `json:"sort"`     // "default", "price_asc", "price_desc"
}

type Service struct {
	db *mongoinfra.Client
}

func NewService(db *mongoinfra.Client) *Service {
	return &Service{db: db}
}

// SearchAll executes tenant-isolated parallel searches across all application modules (backward-compatible).
func (s *Service) SearchAll(ctx context.Context, tenantID bson.ObjectID, query string) (*SearchResponse, error) {
	return s.SearchAllWithOptions(ctx, tenantID, query, SearchFilterOptions{})
}

// SearchAllWithOptions executes tenant-isolated parallel searches applying category, status, type, and date filters.
func (s *Service) SearchAllWithOptions(ctx context.Context, tenantID bson.ObjectID, query string, filterOpts SearchFilterOptions) (*SearchResponse, error) {
	trimmed := strings.TrimSpace(query)
	resp := &SearchResponse{
		Query: trimmed,
		Results: SearchResultsGrouped{
			Menu:       []SearchResultItem{},
			Orders:     []SearchResultItem{},
			Rooms:      []SearchResultItem{},
			Customers:  []SearchResultItem{},
			Tables:     []SearchResultItem{},
			Staff:      []SearchResultItem{},
			Categories: []SearchResultItem{},
		},
		Total: 0,
	}

	if len(trimmed) < 2 || s.db == nil {
		return resp, nil
	}

	// Safe regex pattern: case-insensitive match
	safeRegex := regexp.QuoteMeta(trimmed)

	// Clean variations for order and table identifiers
	cleanNum := strings.TrimPrefix(trimmed, "#")
	cleanNumRegex := regexp.QuoteMeta(cleanNum)

	reqCat := strings.ToLower(strings.TrimSpace(filterOpts.Category))
	isAll := reqCat == "" || reqCat == "all"
	wantMenu := isAll || reqCat == "menu"
	wantOrders := isAll || reqCat == "orders" || reqCat == "payments"
	wantRooms := isAll || reqCat == "rooms" || reqCat == "reservations"
	wantCustomers := isAll || reqCat == "customers" || reqCat == "guests" || reqCat == "reservations"
	wantTables := isAll || reqCat == "tables"
	wantStaff := isAll || reqCat == "staff"
	wantCategories := isAll || reqCat == "categories"

	// Date filter computation
	var dateFilterThreshold *time.Time
	now := time.Now().UTC()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	switch strings.ToLower(filterOpts.Date) {
	case "today":
		dateFilterThreshold = &todayStart
	case "yesterday":
		t := todayStart.AddDate(0, 0, -1)
		dateFilterThreshold = &t
	case "week":
		t := todayStart.AddDate(0, 0, -7)
		dateFilterThreshold = &t
	case "month":
		t := todayStart.AddDate(0, -1, 0)
		dateFilterThreshold = &t
	}

	var wg sync.WaitGroup
	var mu sync.Mutex

	// Timeout context for rapid search queries (max 2 seconds)
	searchCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	limit5 := int64(5)

	// 1. Search Menu Items
	if wantMenu {
		wg.Add(1)
		go func() {
			defer wg.Done()
			coll := s.db.Collection("menu_items")
			filter := bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"name": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"categoryName": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"description": bson.M{"$regex": safeRegex, "$options": "i"}},
				},
			}

			// Apply Dietary Type Filter
			if strings.EqualFold(filterOpts.Type, "veg") {
				filter["isVeg"] = true
			} else if strings.EqualFold(filterOpts.Type, "non_veg") {
				filter["isVeg"] = false
			}

			// Apply Sorting
			sortDef := bson.D{
				{Key: "isAvailable", Value: -1},
				{Key: "displayOrder", Value: 1},
				{Key: "name", Value: 1},
			}
			if strings.EqualFold(filterOpts.Sort, "price_asc") {
				sortDef = bson.D{{Key: "price", Value: 1}}
			} else if strings.EqualFold(filterOpts.Sort, "price_desc") {
				sortDef = bson.D{{Key: "price", Value: -1}}
			}

			opts := options.Find().SetLimit(limit5).SetSort(sortDef)

			cursor, err := coll.Find(searchCtx, filter, opts)
			if err == nil {
				defer cursor.Close(searchCtx)
				var rawItems []struct {
					ID           bson.ObjectID `bson:"_id"`
					Name         string        `bson:"name"`
					CategoryName string        `bson:"categoryName"`
					Price        float64       `bson:"price"`
					IsAvailable  bool          `bson:"isAvailable"`
					IsVeg        bool          `bson:"isVeg"`
					Desc         string        `bson:"description"`
					ImageUrl     string        `bson:"imageUrl"`
				}
				if err := cursor.All(searchCtx, &rawItems); err == nil {
					items := make([]SearchResultItem, 0, len(rawItems))
					for _, itm := range rawItems {
						vegBadge := "Non-Veg"
						if itm.IsVeg {
							vegBadge = "Veg"
						}
						status := "Available"
						if !itm.IsAvailable {
							status = "Sold Out"
						}
						badge := fmt.Sprintf("₹%.0f", itm.Price)
						sub := itm.CategoryName
						if sub == "" {
							sub = "Menu Item"
						}
						sub = fmt.Sprintf("%s • %s • %s", sub, vegBadge, status)

						items = append(items, SearchResultItem{
							ID:        itm.ID.Hex(),
							Title:     itm.Name,
							Subtitle:  sub,
							Category:  "menu",
							Badge:     badge,
							ActionURL: fmt.Sprintf("/dashboard/menu?search=%s", itm.Name),
							Icon:      "utensils",
							Metadata: map[string]interface{}{
								"price":       itm.Price,
								"isVeg":       itm.IsVeg,
								"isAvailable": itm.IsAvailable,
								"category":    itm.CategoryName,
							},
						})
					}
					mu.Lock()
					resp.Results.Menu = items
					mu.Unlock()
				}
			}
		}()
	}

	// 2. Search Orders
	if wantOrders {
		wg.Add(1)
		go func() {
			defer wg.Done()
			coll := s.db.Collection("orders")
			filter := bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"orderNumber": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"orderNumber": bson.M{"$regex": cleanNumRegex, "$options": "i"}},
					{"customerName": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"customerPhone": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"tableName": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"roomNumber": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"status": bson.M{"$regex": "^" + safeRegex, "$options": "i"}},
				},
			}

			// Apply Status Filter
			if filterOpts.Status != "" && !strings.EqualFold(filterOpts.Status, "all") {
				filter["status"] = strings.ToLower(filterOpts.Status)
			}

			// Apply Date Filter
			if dateFilterThreshold != nil {
				filter["createdAt"] = bson.M{"$gte": *dateFilterThreshold}
			}

			opts := options.Find().SetLimit(limit5).SetSort(bson.D{{Key: "createdAt", Value: -1}})

			cursor, err := coll.Find(searchCtx, filter, opts)
			if err == nil {
				defer cursor.Close(searchCtx)
				var rawOrders []struct {
					ID            bson.ObjectID `bson:"_id"`
					OrderNumber   string        `bson:"orderNumber"`
					TableName     string        `bson:"tableName"`
					RoomNumber    string        `bson:"roomNumber"`
					CustomerName  string        `bson:"customerName"`
					CustomerPhone string        `bson:"customerPhone"`
					Status        string        `bson:"status"`
					TotalAmount   float64       `bson:"totalAmount"`
					Destination   string        `bson:"destination"`
				}
				if err := cursor.All(searchCtx, &rawOrders); err == nil {
					orders := make([]SearchResultItem, 0, len(rawOrders))
					for _, ord := range rawOrders {
						loc := ord.TableName
						if loc == "" && ord.RoomNumber != "" {
							loc = fmt.Sprintf("Room %s", ord.RoomNumber)
						}
						if loc == "" {
							loc = "Dine-in"
						}
						cust := ord.CustomerName
						if cust == "" {
							cust = "Guest"
						}
						sub := fmt.Sprintf("%s • %s • ₹%.0f", loc, cust, ord.TotalAmount)

						orders = append(orders, SearchResultItem{
							ID:        ord.ID.Hex(),
							Title:     ord.OrderNumber,
							Subtitle:  sub,
							Category:  "orders",
							Badge:     strings.ToUpper(ord.Status),
							ActionURL: fmt.Sprintf("/dashboard/orders?search=%s", strings.TrimPrefix(ord.OrderNumber, "#")),
							Icon:      "receipt",
							Metadata: map[string]interface{}{
								"status":      ord.Status,
								"amount":      ord.TotalAmount,
								"table":       ord.TableName,
								"room":        ord.RoomNumber,
								"customer":    ord.CustomerName,
								"destination": ord.Destination,
							},
						})
					}
					mu.Lock()
					resp.Results.Orders = orders
					mu.Unlock()
				}
			}
		}()
	}

	// 3. Search Guest Rooms & Suites
	if wantRooms {
		wg.Add(1)
		go func() {
			defer wg.Done()
			coll := s.db.Collection("rooms")
			filter := bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"roomNumber": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"name": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"roomType": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"currentGuestName": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"currentGuestPhone": bson.M{"$regex": safeRegex, "$options": "i"}},
				},
			}

			// Apply Room Status Filter
			if filterOpts.Status != "" && !strings.EqualFold(filterOpts.Status, "all") {
				filter["status"] = strings.ToLower(filterOpts.Status)
			}

			opts := options.Find().SetLimit(limit5).SetSort(bson.D{{Key: "roomNumber", Value: 1}})

			cursor, err := coll.Find(searchCtx, filter, opts)
			if err == nil {
				defer cursor.Close(searchCtx)
				var rawRooms []struct {
					ID                bson.ObjectID `bson:"_id"`
					RoomNumber        string        `bson:"roomNumber"`
					Name              string        `bson:"name"`
					RoomType          string        `bson:"roomType"`
					Floor             string        `bson:"floor"`
					Status            string        `bson:"status"`
					CurrentGuestName  string        `bson:"currentGuestName"`
					CurrentGuestPhone string        `bson:"currentGuestPhone"`
				}
				if err := cursor.All(searchCtx, &rawRooms); err == nil {
					rooms := make([]SearchResultItem, 0, len(rawRooms))
					for _, rm := range rawRooms {
						sub := fmt.Sprintf("%s", strings.Title(rm.RoomType))
						if rm.Floor != "" {
							sub = fmt.Sprintf("%s • Floor %s", sub, rm.Floor)
						}
						if rm.CurrentGuestName != "" {
							sub = fmt.Sprintf("%s • Guest: %s", sub, rm.CurrentGuestName)
						}

						title := rm.Name
						if title == "" {
							title = fmt.Sprintf("Room %s", rm.RoomNumber)
						}

						rooms = append(rooms, SearchResultItem{
							ID:        rm.ID.Hex(),
							Title:     title,
							Subtitle:  sub,
							Category:  "rooms",
							Badge:     strings.ToUpper(rm.Status),
							ActionURL: fmt.Sprintf("/dashboard/rooms/%s", rm.ID.Hex()),
							Icon:      "bed",
							Metadata: map[string]interface{}{
								"roomNumber": rm.RoomNumber,
								"status":     rm.Status,
								"roomType":   rm.RoomType,
								"guest":      rm.CurrentGuestName,
							},
						})
					}
					mu.Lock()
					resp.Results.Rooms = rooms
					mu.Unlock()
				}
			}
		}()
	}

	// 4. Search Customers & Hotel Guests
	if wantCustomers {
		wg.Add(1)
		go func() {
			defer wg.Done()
			customers := make([]SearchResultItem, 0, 5)
			seenPhones := make(map[string]bool)

			// Search guests collection first (hotel guests)
			guestsColl := s.db.Collection("guests")
			gFilter := bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"name": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"phone": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"email": bson.M{"$regex": safeRegex, "$options": "i"}},
				},
			}
			if dateFilterThreshold != nil {
				gFilter["createdAt"] = bson.M{"$gte": *dateFilterThreshold}
			}

			gOpts := options.Find().SetLimit(limit5).SetSort(bson.D{{Key: "createdAt", Value: -1}})
			if cursor, err := guestsColl.Find(searchCtx, gFilter, gOpts); err == nil {
				defer cursor.Close(searchCtx)
				var rawGuests []struct {
					ID         bson.ObjectID `bson:"_id"`
					RoomID     bson.ObjectID `bson:"roomId"`
					RoomNumber string        `bson:"roomNumber"`
					Name       string        `bson:"name"`
					Phone      string        `bson:"phone"`
					Email      string        `bson:"email"`
					Status     string        `bson:"status"`
				}
				if err := cursor.All(searchCtx, &rawGuests); err == nil {
					for _, g := range rawGuests {
						seenKey := strings.TrimSpace(g.Phone)
						if seenKey == "" {
							seenKey = strings.ToLower(strings.TrimSpace(g.Name))
						}
						seenPhones[seenKey] = true

						sub := g.Phone
						if g.RoomNumber != "" {
							sub = fmt.Sprintf("Room %s • %s", g.RoomNumber, sub)
						}
						badge := "Hotel Guest"
						if g.Status == "checked_in" {
							badge = "In-House"
						}

						action := "/dashboard/rooms"
						if !g.RoomID.IsZero() {
							action = fmt.Sprintf("/dashboard/rooms/%s", g.RoomID.Hex())
						}

						customers = append(customers, SearchResultItem{
							ID:        g.ID.Hex(),
							Title:     g.Name,
							Subtitle:  sub,
							Category:  "customers",
							Badge:     badge,
							ActionURL: action,
							Icon:      "user",
							Metadata: map[string]interface{}{
								"phone":      g.Phone,
								"email":      g.Email,
								"roomNumber": g.RoomNumber,
								"type":       "hotel_guest",
							},
						})
					}
				}
			}

			// Search customers collection (restaurant diners) if under limit
			if len(customers) < 5 {
				custColl := s.db.Collection("customers")
				cFilter := bson.M{
					"tenantId": tenantID,
					"$or": []bson.M{
						{"name": bson.M{"$regex": safeRegex, "$options": "i"}},
						{"phone": bson.M{"$regex": safeRegex, "$options": "i"}},
					},
				}
				cOpts := options.Find().SetLimit(limit5).SetSort(bson.D{{Key: "updatedAt", Value: -1}})
				if cursor, err := custColl.Find(searchCtx, cFilter, cOpts); err == nil {
					defer cursor.Close(searchCtx)
					var rawCusts []struct {
						ID          bson.ObjectID `bson:"_id"`
						Name        string        `bson:"name"`
						Phone       string        `bson:"phone"`
						TotalOrders int           `bson:"totalOrders"`
						TotalSpent  float64       `bson:"totalSpent"`
					}
					if err := cursor.All(searchCtx, &rawCusts); err == nil {
						for _, c := range rawCusts {
							seenKey := strings.TrimSpace(c.Phone)
							if seenKey == "" {
								seenKey = strings.ToLower(strings.TrimSpace(c.Name))
							}
							if seenPhones[seenKey] {
								continue
							}
							seenPhones[seenKey] = true

							sub := c.Phone
							if c.TotalOrders > 0 {
								sub = fmt.Sprintf("%s • %d orders • ₹%.0f", c.Phone, c.TotalOrders, c.TotalSpent)
							}

							customers = append(customers, SearchResultItem{
								ID:        c.ID.Hex(),
								Title:     c.Name,
								Subtitle:  sub,
								Category:  "customers",
								Badge:     "Diner",
								ActionURL: fmt.Sprintf("/dashboard/orders?search=%s", c.Phone),
								Icon:      "user",
								Metadata: map[string]interface{}{
									"phone":       c.Phone,
									"totalOrders": c.TotalOrders,
									"totalSpent":  c.TotalSpent,
									"type":        "restaurant_diner",
								},
							})
							if len(customers) >= 5 {
								break
							}
						}
					}
				}
			}

			mu.Lock()
			resp.Results.Customers = customers
			mu.Unlock()
		}()
	}

	// 5. Search Tables
	if wantTables {
		wg.Add(1)
		go func() {
			defer wg.Done()
			coll := s.db.Collection("tables")
			filter := bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"name": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"zone": bson.M{"$regex": safeRegex, "$options": "i"}},
				},
			}

			if filterOpts.Status != "" && !strings.EqualFold(filterOpts.Status, "all") {
				filter["status"] = strings.ToLower(filterOpts.Status)
			}

			opts := options.Find().SetLimit(limit5).SetSort(bson.D{{Key: "name", Value: 1}})

			cursor, err := coll.Find(searchCtx, filter, opts)
			if err == nil {
				defer cursor.Close(searchCtx)
				var rawTables []struct {
					ID     bson.ObjectID `bson:"_id"`
					Name   string        `bson:"name"`
					Zone   string        `bson:"zone"`
					Seats  int           `bson:"seats"`
					Status string        `bson:"status"`
				}
				if err := cursor.All(searchCtx, &rawTables); err == nil {
					tables := make([]SearchResultItem, 0, len(rawTables))
					for _, tbl := range rawTables {
						zone := tbl.Zone
						if zone == "" {
							zone = "Main Dining"
						}
						sub := fmt.Sprintf("%s • %d Seats", zone, tbl.Seats)

						tables = append(tables, SearchResultItem{
							ID:        tbl.ID.Hex(),
							Title:     tbl.Name,
							Subtitle:  sub,
							Category:  "tables",
							Badge:     strings.ToUpper(tbl.Status),
							ActionURL: fmt.Sprintf("/dashboard/tables?search=%s", tbl.Name),
							Icon:      "table",
							Metadata: map[string]interface{}{
								"zone":   tbl.Zone,
								"seats":  tbl.Seats,
								"status": tbl.Status,
							},
						})
					}
					mu.Lock()
					resp.Results.Tables = tables
					mu.Unlock()
				}
			}
		}()
	}

	// 6. Search Staff / Users
	if wantStaff {
		wg.Add(1)
		go func() {
			defer wg.Done()
			coll := s.db.Collection("users")
			filter := bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"name": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"email": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"phone": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"role": bson.M{"$regex": safeRegex, "$options": "i"}},
				},
			}
			opts := options.Find().SetLimit(limit5).SetSort(bson.D{{Key: "name", Value: 1}})

			cursor, err := coll.Find(searchCtx, filter, opts)
			if err == nil {
				defer cursor.Close(searchCtx)
				var rawUsers []struct {
					ID     bson.ObjectID `bson:"_id"`
					Name   string        `bson:"name"`
					Email  string        `bson:"email"`
					Phone  string        `bson:"phone"`
					Role   string        `bson:"role"`
					Status string        `bson:"status"`
				}
				if err := cursor.All(searchCtx, &rawUsers); err == nil {
					staff := make([]SearchResultItem, 0, len(rawUsers))
					for _, u := range rawUsers {
						sub := u.Email
						if sub == "" {
							sub = u.Phone
						}
						if sub == "" {
							sub = "Team Member"
						}

						roleLabel := strings.Title(u.Role)
						if roleLabel == "" {
							roleLabel = "Staff"
						}

						staff = append(staff, SearchResultItem{
							ID:        u.ID.Hex(),
							Title:     u.Name,
							Subtitle:  sub,
							Category:  "staff",
							Badge:     roleLabel,
							ActionURL: "/dashboard/staff",
							Icon:      "shield",
							Metadata: map[string]interface{}{
								"role":   u.Role,
								"email":  u.Email,
								"phone":  u.Phone,
								"status": u.Status,
							},
						})
					}
					mu.Lock()
					resp.Results.Staff = staff
					mu.Unlock()
				}
			}
		}()
	}

	// 7. Search Menu Categories
	if wantCategories {
		wg.Add(1)
		go func() {
			defer wg.Done()
			coll := s.db.Collection("menu_categories")
			filter := bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"name": bson.M{"$regex": safeRegex, "$options": "i"}},
					{"description": bson.M{"$regex": safeRegex, "$options": "i"}},
				},
			}
			opts := options.Find().SetLimit(limit5).SetSort(bson.D{{Key: "displayOrder", Value: 1}})

			cursor, err := coll.Find(searchCtx, filter, opts)
			if err == nil {
				defer cursor.Close(searchCtx)
				var rawCats []struct {
					ID          bson.ObjectID `bson:"_id"`
					Name        string        `bson:"name"`
					Description string        `bson:"description"`
					Slug        string        `bson:"slug"`
				}
				if err := cursor.All(searchCtx, &rawCats); err == nil {
					cats := make([]SearchResultItem, 0, len(rawCats))
					for _, c := range rawCats {
						sub := c.Description
						if sub == "" {
							sub = "Menu Category"
						}

						cats = append(cats, SearchResultItem{
							ID:        c.ID.Hex(),
							Title:     c.Name,
							Subtitle:  sub,
							Category:  "categories",
							Badge:     "Category",
							ActionURL: fmt.Sprintf("/dashboard/menu?category=%s", c.Name),
							Icon:      "tag",
							Metadata: map[string]interface{}{
								"slug": c.Slug,
							},
						})
					}
					mu.Lock()
					resp.Results.Categories = cats
					mu.Unlock()
				}
			}
		}()
	}

	wg.Wait()

	resp.Total = len(resp.Results.Menu) +
		len(resp.Results.Orders) +
		len(resp.Results.Rooms) +
		len(resp.Results.Customers) +
		len(resp.Results.Tables) +
		len(resp.Results.Staff) +
		len(resp.Results.Categories)

	return resp, nil
}
