import ToolPage from '../../components/ToolPage'

export default function PptxToPdf() {
  return (
    <ToolPage
      title="PPTX to PDF"
      description="Convert PowerPoint presentations to PDF instantly"
      icon="📊"
      gradient="from-red-500 to-orange-500"
      accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
      multiple={false}
      apiUrl="http://localhost:5000/api/doc/pptx-to-pdf"
      fieldName="file"
      backLink="/pdf-tools"
      backLabel="Back to PDF Tools"
    />
  )
}