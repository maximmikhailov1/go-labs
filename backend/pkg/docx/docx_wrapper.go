package docx

import (
	"archive/zip"
	"github.com/fumiama/go-docx"
	"io"
)

type DocumentWrapper struct {
	*docx.Document
}

func (dw *DocumentWrapper) Write(w io.Writer) error {
	// Реализация аналогичная приведённой выше
	zipWriter := zip.NewWriter(w)
	defer zipWriter.Close()
	// Создаём ZIP-архив
	zipWriter := zip.NewWriter(w)
	defer zipWriter.Close()

	// 1. Добавляем document.xml
	docFile, err := zipWriter.Create("word/document.xml")
	if err != nil {
		return err
	}

	docFile.Write([]byte(`<?xml version="1.0" encoding="UTF-8"?>`))
	docFile.Write([]byte(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>`))

	for _, elem := range d.elements {
		if _, err := docFile.Write(elem.Bytes()); err != nil {
			return err
		}
	}

	docFile.Write([]byte(`</w:body></w:document>`))

	// 2. Добавляем необходимые служебные файлы
	addContentTypes(zipWriter)
	addRels(zipWriter)

	return nil
	// ... (полная реализация записи DOCX)
}

func NewWrapper() *DocumentWrapper {
	return &DocumentWrapper{docx.New()}
}
