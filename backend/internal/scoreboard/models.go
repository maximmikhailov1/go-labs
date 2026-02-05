package scoreboard

type EntryResponse struct {
	Rank           int    `json:"rank"`
	UserID         uint   `json:"userId"`
	FullName       string `json:"fullName"`
	CompletedCount int64  `json:"completedCount"`
	DefendedCount  int64  `json:"defendedCount"`
}
