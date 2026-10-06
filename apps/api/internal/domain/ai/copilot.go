package ai

// CopilotBriefResponse is the morning executive summary for the restaurant general manager.
type CopilotBriefResponse struct {
	YesterdayRevenue   float64  `json:"yesterdayRevenue"`
	RevenueDeltaPerc   float64  `json:"revenueDeltaPerc"`
	CompletedOrders    int      `json:"completedOrders"`
	TopDishes          []string `json:"topDishes"`
	AvgTurnoverMinutes int      `json:"avgTurnoverMinutes"`
	ActionableInsights []string `json:"actionableInsights"`
	Timestamp          string   `json:"timestamp"`
}

// CopilotQueryRequest carries a manager's natural language query.
type CopilotQueryRequest struct {
	Query string `json:"query"`
	Scope string `json:"scope,omitempty"` // "sales" | "inventory" | "sentiment" | "general"
}

// CopilotQueryResponse contains the markdown response, structured metric summaries, and follow-up prompts.
type CopilotQueryResponse struct {
	AnswerMarkdown     string                 `json:"answerMarkdown"`
	MetricSummary      map[string]interface{} `json:"metricSummary,omitempty"`
	SuggestedFollowUps []string               `json:"suggestedFollowUps,omitempty"`
}
