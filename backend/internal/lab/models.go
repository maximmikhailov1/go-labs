package lab

type LabResponse struct {
	ID                      uint   `json:"id"`
	Number                  string `json:"number"`
	Description             string `json:"description"`
	MaxStudents             int    `json:"maxStudents"`
	IsMandatory             bool   `json:"isMandatory"`
	SwitchesRequired        int    `json:"switchesRequired"`
	RoutersRequired         int    `json:"routersRequired"`
	WirelessRoutersRequired int    `json:"wirelessRoutersRequired"`
	HPRoutersRequired       int    `json:"hpRoutersRequired"`
	HPSwitchesRequired      int    `json:"hpSwitchesRequired"`
	SubjectID               uint   `json:"subjectId"`
}

type CreateRequest struct {
	Number                  string `json:"number" validate:"required"`
	Description             string `json:"description"`
	MaxStudents             int    `json:"maxStudents" validate:"min=1"`
	IsMandatory             *bool  `json:"isMandatory"`
	SwitchesRequired        int    `json:"switchesRequired"`
	RoutersRequired         int    `json:"routersRequired"`
	WirelessRoutersRequired int    `json:"wirelessRoutersRequired"`
	HPRoutersRequired       int    `json:"hpRoutersRequired"`
	HPSwitchesRequired      int    `json:"hpSwitchesRequired"`
	SubjectID               uint   `json:"subjectId" validate:"required"`
}

type NumbersResponse struct {
	Numbers []string `json:"numbers"`
}
