# Visual Regression & Before/After Comparison

## 1. Menu Items Table — Status Column & Quick Actions Overlap

| Viewport | Before | After | Resolution |
|---|---|---|---|
| **1024px (Tablet Landscape)** | Status badge and Edit button overlapped: `In StockEdit` | Status column expanded to `col-span-2`; Edit button cleanly separated | Rebalanced grid columns from `5-2-2-1-2` to `4-2-2-2-2` |

```diff
- <div className="col-span-5 ...">Dish & Culinary Details</div>
- <div className="col-span-1">Status</div>
+ <div className="col-span-4 ...">Dish & Culinary Details</div>
+ <div className="col-span-2">Status</div>
```

---

## 2. TopBar Global Search & KDS Pill Squeeze

| Viewport | Before | After | Resolution |
|---|---|---|---|
| **1024px (Small Laptop / iPad)** | Search placeholder compressed to `Sea...`; breadcrumb and badges cramped | Search input retains `max-w-sm`; KDS pill hidden below `xl:`; header has ample breathing room | Gated KDS Connected badge to `hidden xl:flex` |

```diff
- <div className="hidden lg:flex items-center ...">KDS Connected</div>
+ <div className="hidden xl:flex items-center ...">KDS Connected</div>
```

---

## 3. TopBar Mobile Title Truncation

| Viewport | Before | After | Resolution |
|---|---|---|---|
| **375px (Small Mobile)** | Current title displayed as `Workspac...` | Full title `Workspace Overview` displayed cleanly | Increased max-width scale to `max-w-[160px] sm:max-w-[220px]` |

```diff
- <span className="... truncate max-w-[100px] sm:max-w-[160px] ...">{currentTitle}</span>
+ <span className="... truncate max-w-[160px] sm:max-w-[220px] md:max-w-[260px] ...">{currentTitle}</span>
```

---

## 4. Mobile Touch Targets (WCAG 44×44px Standard)

| Component | Before | After | Status |
|---|---|---|---|
| **Hamburger Button** | 36×36px | `min-h-[44px] min-w-[44px]` (44×44px) | ✅ Fixed |
| **Theme Toggle Button** | 34×34px | `min-h-[44px] min-w-[44px]` (44×44px) | ✅ Fixed |
| **Notification Bell Button** | 38×38px | `min-h-[44px] min-w-[44px]` (44×44px) | ✅ Fixed |
| **User Profile Button** | 40×40px | `min-h-[44px]` (44px height) | ✅ Fixed |
| **Button Component Variants** | 32-36px | `min-h-[44px]` on touch screens | ✅ Fixed |

---

## 5. Live KDS Order Card Table Name

| Viewport | Before | After | Resolution |
|---|---|---|---|
| **All Viewports** | Order card header displayed `D..` | Full table name `Table 12` / `Dine-In` displayed | Removed `w-full truncate` inside flex-wrap container |

```diff
- <span className="... min-w-0 w-full truncate">{formatKdsTableName(order.table)}</span>
+ <span className="... shrink-0 max-w-full truncate">{formatKdsTableName(order.table)}</span>
```
