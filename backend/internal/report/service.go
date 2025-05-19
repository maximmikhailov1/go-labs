package report

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"github.com/fumiama/go-docx"
	"github.com/maximmikhailov1/go-labs/backend/internal/models"
	"io"
	"os"
	"time"
)

type Service struct {
	repo         *Repository
	templatePath string
}

func NewService(repo *Repository) (*Service, error) {
	templatePath := "/app/templates/report_template.docx"

	if _, err := os.Stat(templatePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("template file not found at %s", templatePath)
	}
	return &Service{
		repo:         repo,
		templatePath: templatePath,
	}, nil
}

func (s *Service) GenerateReport(recordIDs []uint) (*bytes.Buffer, error) {
	if len(recordIDs) == 0 {
		return nil, errors.New("no record IDs provided")
	}

	records, err := s.repo.GetRecordsForReport(recordIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to get records: %w", err)
	}

	if len(records) == 0 {
		return nil, errors.New("no records found")
	}
	return s.generateDocxReport(records)
}

func (s *Service) generateDocxReport(records []models.Record) (*bytes.Buffer, error) {
	// 1. Создаём новый документ
	doc := docx.New().WithA4Page() // A4 с альбомной ориентацией
	// 2. Добавляем заголовок
	for _, record := range records {
		para := doc.AddParagraph()
		para.AddText(fmt.Sprintf("Дата: %s", time.Time(record.LabDate).Format("02.01.2006"))).Size("14")
		para.AddText(fmt.Sprintf("Пара: %d", record.ClassNumber)).Size("14")

		var rows = 0
		for _, entry := range record.Entries {
			rows += len(entry.Team.Members)
		}
		var TBC = &docx.APITableBorderColors{
			Top:     "000000",
			Left:    "000000",
			Bottom:  "000000",
			Right:   "000000",
			InsideH: "000000",
			InsideV: "000000",
		}
		table := doc.AddTable(rows+1, 5, 15000, TBC)

		var tableRows = table.TableRows
		var headerRow = tableRows[0]
		var headerCells = headerRow.TableCells
		headerCells[0].AddParagraph().AddText("ФИО").Color("black")
		headerCells[1].AddParagraph().AddText("Группа").Color("black")
		headerCells[2].AddParagraph().AddText("Предмет").Color("black")
		headerCells[3].AddParagraph().AddText("Лабораторная").Color("black")
		headerCells[4].AddParagraph().AddText("ФИО преподавателя").Color("black")

		for _, entry := range record.Entries {
			for j, member := range entry.Team.Members {
				var tableRow = tableRows[j+1]
				var tableCells = tableRow.TableCells
				tableCells[0].AddParagraph().AddText(member.FullName)
				tableCells[1].AddParagraph().AddText(member.Group.Name)
				tableCells[2].AddParagraph().AddText(member.Group.Subject.Name)
				tableCells[3].AddParagraph().AddText(entry.Lab.Number)
				tableCells[4].AddParagraph().AddText(record.Tutor.FullName)
			}
		}
		doc.AddParagraph().AddText("Подпись преподавателя: ___________________").Size("12")
		doc.AddParagraph().AddPageBreaks()
	}

	docXML := doc.Build() // Это не публичный метод, но мы можем создать его

	// 4. Создаём полноценный DOCX-файл
	buf := new(bytes.Buffer)
	if err := createDocxFromXML(buf, docXML); err != nil {
		return nil, fmt.Errorf("ошибка создания DOCX: %w", err)
	}

	return buf, nil
}

func createDocxFromXML(w io.Writer, docXML []byte) error {
	// 1. Создаём ZIP-архив
	zipWriter := zip.NewWriter(w)
	defer zipWriter.Close()

	// 2. Добавляем обязательные файлы DOCX
	files := map[string][]byte{
		"word/document.xml": docXML,
		"[Content_Types].xml": []byte(`<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`),
	}

	// 3. Записываем файлы в архив
	for name, content := range files {
		f, err := zipWriter.Create(name)
		if err != nil {
			return err
		}
		if _, err := f.Write(content); err != nil {
			return err
		}
	}

	return nil
}
