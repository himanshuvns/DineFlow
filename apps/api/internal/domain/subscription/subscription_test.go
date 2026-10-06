package subscription

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestPlanLimits(t *testing.T) {
	subFree := &Subscription{
		TenantID: bson.NewObjectID(),
		Plan:     PlanFree,
		Status:   StatusActive,
	}

	assert.True(t, subFree.CanAddTable(4))
	assert.False(t, subFree.CanAddTable(5)) // Hard limit 5 tables on Free

	assert.True(t, subFree.CanAddMenuItem(29))
	assert.False(t, subFree.CanAddMenuItem(30)) // Hard limit 30 items on Free

	subStarter := &Subscription{
		TenantID: bson.NewObjectID(),
		Plan:     PlanStarter,
		Status:   StatusActive,
	}

	assert.True(t, subStarter.CanAddTable(9))
	assert.False(t, subStarter.CanAddTable(10)) // Hard limit 10 tables on Starter
	assert.True(t, subStarter.CanAddMenuItem(99))
	assert.False(t, subStarter.CanAddMenuItem(100)) // Hard limit 100 items on Starter

	subGrowth := &Subscription{
		TenantID: bson.NewObjectID(),
		Plan:     PlanGrowth,
		Status:   StatusActive,
	}

	assert.True(t, subGrowth.CanAddTable(49))
	assert.False(t, subGrowth.CanAddTable(50)) // Max 50 tables on Growth
	assert.True(t, subGrowth.CanAddMenuItem(500)) // Unlimited items on Growth

	subHotel := &Subscription{
		TenantID: bson.NewObjectID(),
		Plan:     PlanHotelPro,
		Status:   StatusActive,
	}

	assert.True(t, subHotel.CanAddTable(1000))    // Unlimited tables on Hotel Pro
	assert.True(t, subHotel.CanAddMenuItem(2000)) // Unlimited items on Hotel Pro
}

func TestGracePeriod(t *testing.T) {
	sub := &Subscription{
		TenantID: bson.NewObjectID(),
		Plan:     PlanGrowth,
		Status:   StatusActive,
	}

	sub.EnterGracePeriod()
	assert.Equal(t, StatusGracePeriod, sub.Status)
	assert.NotNil(t, sub.GracePeriodEnd)
	assert.False(t, sub.IsGracePeriodExpired())

	// Simulate expired grace period
	expired := time.Now().UTC().Add(-1 * time.Hour)
	sub.GracePeriodEnd = &expired
	assert.True(t, sub.IsGracePeriodExpired())
}

func TestPricingCalculations(t *testing.T) {
	subMonthly := &Subscription{
		Plan:  PlanGrowth,
		Cycle: CycleMonthly,
	}
	assert.Equal(t, 2999.0, subMonthly.GetPrice())

	subAnnual := &Subscription{
		Plan:  PlanGrowth,
		Cycle: CycleAnnual,
	}
	assert.Equal(t, 2399.0*12, subAnnual.GetPrice())
}
