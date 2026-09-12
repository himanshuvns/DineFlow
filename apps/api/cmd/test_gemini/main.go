package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	key := os.Getenv("GEMINI_API_KEY")
	if key == "" {
		fmt.Println("❌ GEMINI_API_KEY not set")
		return
	}
	fmt.Printf("✅ Key loaded: %s...\n", key[:min(20, len(key))])

	reqBody := map[string]interface{}{
		"system_instruction": map[string]interface{}{
			"parts": []map[string]string{{"text": "You are DineBot, a friendly restaurant assistant. Respond in 1-2 sentences."}},
		},
		"contents": []map[string]interface{}{
			{"parts": []map[string]string{{"text": "What are today's specials at The Grand Bistro?"}}},
		},
	}

	b, _ := json.Marshal(reqBody)
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=%s", key)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	req, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("❌ HTTP error:", err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %d\n", resp.StatusCode)

	var result map[string]interface{}
	json.Unmarshal(body, &result)
	if candidates, ok := result["candidates"].([]interface{}); ok && len(candidates) > 0 {
		if content, ok := candidates[0].(map[string]interface{})["content"].(map[string]interface{}); ok {
			if parts, ok := content["parts"].([]interface{}); ok && len(parts) > 0 {
				if text, ok := parts[0].(map[string]interface{})["text"].(string); ok {
					fmt.Println("✅ Gemini reply:", text)
					return
				}
			}
		}
	}
	fmt.Println("Raw response:", string(body[:min(400, len(body))]))
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
