package audience

import "time"

type CreateRequest struct {
	Number          string `json:"number" validate:"required"`
	Routers         int    `json:"routers"`
	Switches        int    `json:"switches"`
	WirelessRouters int    `json:"wirelessRouters"`
	HPRouters       int    `json:"hpRouters"`
	HPSwitches      int    `json:"hpSwitches"`
}

type UpdateRequest struct {
	Number          string `json:"number"`
	Routers         *int   `json:"routers"`
	Switches        *int   `json:"switches"`
	WirelessRouters *int   `json:"wirelessRouters"`
	HPRouters       *int   `json:"hpRouters"`
	HPSwitches      *int   `json:"hpSwitches"`
}

type AudienceResponse struct {
	ID              uint      `json:"id"`
	Number          string    `json:"number"`
	Routers         int       `json:"routers"`
	Switches        int       `json:"switches"`
	WirelessRouters int       `json:"wirelessRouters"`
	HPRouters       int       `json:"hpRouters"`
	HPSwitches      int       `json:"hpSwitches"`
	CreatedAt       time.Time `json:"createdAt"`
}
