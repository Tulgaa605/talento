import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // If the message is a CV analysis or job matches, return it directly
    if (message.startsWith('CV Шинжилгээ:') || message.startsWith('Таны CV-тэй тохирох ажлын байрууд:')) {
      return NextResponse.json({ response: message });
    }

    // Get user's CVs from database
    const cvs = await prisma.cV.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    const cvContent = cvs[0]?.content || 'No CV uploaded yet';
    console.log('CV Content:', cvContent);

    try {
      console.log('Sending request to OpenRouter...');
      
      if (!process.env.OPENROUTER_API_KEY) {
        console.error('OpenRouter API key is missing');
        return NextResponse.json({
          response: 'Системийн алдаа гарлаа. Админтай холбоо барина уу.'
        });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
          "X-Title": "CV Analyzer",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-v3-base:free",
          "max_tokens": 2000,
          "temperature": 0.7,
          "messages": [
            {
              role: 'system',
              content: `You are a CV analyzer. Analyze the following CV content and provide detailed feedback in Mongolian language.

CV Content: ${cvContent}

Provide a comprehensive analysis in this exact format:

CV Шинжилгээ:

- Хүч талууд:
  * Тодорхой бичнэ үү
  * Жишээгээр дэмжнэ үү

- Сул талууд:
  * Тодорхой бичнэ үү
  * Жишээгээр дэмжнэ үү

Сайжруулах Хэсгүүд:
- Хэсэг бүрийг тодорхойлно уу
- Яагаад сайжруулах шаардлагатайг тайлбарлана уу
- Жишээгээр дэмжнэ үү

Тодорхой Зөвлөмж:
- Хэсэг бүрт тодорхой зөвлөмж өгнө үү
- Хэрэгжүүлэх боломжтой байх ёстой
- Жишээгээр дэмжнэ үү

Жишээ болон Хувилбарууд:
- Хэсэг бүрт жишээ өгнө үү
- Хувилбаруудыг тодорхойлно уу
- Яагаад эдгээр нь сайн гэдгийг тайлбарлана уу

Алхам Алхмаар Зааварчилгаа:
- Хэсэг бүрийг хэрхэн сайжруулах вэ
- Тодорхой алхмуудыг бичнэ үү
- Жишээгээр дэмжнэ үү

Хариултаа дэлгэрэнгүй, тодорхой, ойлгомжтой байлгана уу.`
            },
            {
              role: 'user',
              content: message
            }
          ]
        })
      });

      console.log('OpenRouter response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('OpenRouter API error:', responseText);
        let errorMessage = 'Системийн алдаа гарлаа. Дараа дахин оролдоно уу.';
        
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error?.code === 429) {
            errorMessage = `Уучлаарай, одоогоор системийн хязгаарлалттай байна. Дараах зүйлсийг хийж болно:

1. Хэдэн минут хүлээгээд дахин оролдоно уу
2. Чат функцээр CV-гээ дэлгэрэнгүй шинжилгээ хийх боломжтой
3. CV-гээ засварлаад дахин илгээх

Одоогийн байдлаар CV-г амжилттай хадгалж авлаа. Дараа дахин оролдох үед дэлгэрэнгүй шинжилгээ хийх боломжтой.`;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        return NextResponse.json({
          response: errorMessage
        });
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        return NextResponse.json({
          response: 'Системийн алдаа гарлаа. Дараа дахин оролдоно уу.'
        });
      }

      console.log('Parsed response data:', data);

      if (!data?.choices?.[0]?.message?.content) {
        console.error('Invalid response structure:', data);
        return NextResponse.json({
          response: 'Системийн алдаа гарлаа. Дараа дахин оролдоно уу.'
        });
      }

      const content = data.choices[0].message.content;
      console.log('Generated content:', content);

      if (!content || content.trim().length === 0) {
        console.error('Empty content received');
        return NextResponse.json({
          response: 'Системийн алдаа гарлаа. Дараа дахин оролдоно уу.'
        });
      }

      return NextResponse.json({
        response: content
      });
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return NextResponse.json({
        response: 'Системийн алдаа гарлаа. Дараа дахин оролдоно уу.'
      });
    }
  } catch (error) {
    console.error('Chat route error:', error);
    return NextResponse.json({
      response: 'Системийн алдаа гарлаа. Дараа дахин оролдоно уу.'
    });
  }
} 