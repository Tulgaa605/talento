import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlink } from 'fs';
import { join } from 'path';
import PizZip from 'pizzip';

export const dynamic = 'force-dynamic';

interface Report {
  id: number;
  name: string;
  type: string;
  period: string;
  status: string;
  size: string;
  format: string;
  department: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  description: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = parseInt(id);

    // Fetch report from API
    const baseUrl = request.nextUrl.origin;
    const reportResponse = await fetch(`${baseUrl}/api/hr/reports`);
    
    if (!reportResponse.ok) {
      return NextResponse.json({ error: 'Тайлан олдсонгүй' }, { status: 404 });
    }

    const reports: Report[] = await reportResponse.json();
    const report = reports.find(r => r.id === reportId);

    if (!report) {
      return NextResponse.json({ error: 'Тайлан олдсонгүй' }, { status: 404 });
    }

    // Create a simple Word document template
    const templateContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
        </w:rPr>
        <w:t>ТАЙЛАНГИЙН ДЭЛГЭРЭНГҮЙ МЭДЭЭЛЭЛ</w:t>
      </w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:t>Тайлангийн нэр: ___REPORT_NAME___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Төрөл: ___REPORT_TYPE___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Хугацаа: ___REPORT_PERIOD___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Төлөв: ___REPORT_STATUS___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Хэмжээ: ___REPORT_SIZE___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Формат: ___REPORT_FORMAT___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Хэлтэс: ___REPORT_DEPARTMENT___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Үүсгэсэн: ___REPORT_CREATED_BY___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Үүсгэсэн огноо: ___REPORT_CREATED_AT___</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Сүүлд засварласан: ___REPORT_LAST_MODIFIED___</w:t>
      </w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Тайлбар:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>___REPORT_DESCRIPTION___</w:t>
      </w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:t>Экспорт хийсэн огноо: ___EXPORT_DATE___</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

    // Create a minimal Word document structure
    const zip = new PizZip();
    
    // Add document.xml
    let documentXml = templateContent
      .replace(/___REPORT_NAME___/g, report.name || '-')
      .replace(/___REPORT_TYPE___/g, report.type || '-')
      .replace(/___REPORT_PERIOD___/g, report.period || '-')
      .replace(/___REPORT_STATUS___/g, report.status || '-')
      .replace(/___REPORT_SIZE___/g, report.size || '-')
      .replace(/___REPORT_FORMAT___/g, report.format || '-')
      .replace(/___REPORT_DEPARTMENT___/g, report.department || '-')
      .replace(/___REPORT_CREATED_BY___/g, report.createdBy || '-')
      .replace(/___REPORT_CREATED_AT___/g, report.createdAt || '-')
      .replace(/___REPORT_LAST_MODIFIED___/g, report.lastModified || '-')
      .replace(/___REPORT_DESCRIPTION___/g, report.description || '(Тайлбар байхгүй)')
      .replace(/___EXPORT_DATE___/g, new Date().toLocaleString('mn-MN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));

    zip.file('word/document.xml', documentXml);

    // Add minimal required files for Word document
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

    // Add word/settings.xml
    zip.file('word/settings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
</w:settings>`);

    // Add word/styles.xml
    zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`);

    // Generate the Word document
    const outputBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    const safeReportName = (report.name || 'Тайлан')
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${safeReportName}_дэлгэрэнгүй_${dateStr}.docx`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json(
      { error: 'Word файл үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}

