import type { ProcessStep } from "./types";

const steps: ProcessStep[] = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/0993b2182737f6efecd080e45cfb782def4a8bfc?placeholderIfAbsent=true",
    title: "Бүртгэл үүсгэх",
    description: "Нэвтрэх товчин дээр даран өөрийн Имэйл-ээр бүртгэл үүсгэнэ.",
  },
  {
    icon: "AI",
    title: "AI товчин дээр дарах",
    description: "Баруун дээр байрлах AI-товчийг дарна уу.",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/a24df4711f630035b223ebbc7bb2f14cd1d52266?placeholderIfAbsent=true",
    title: "Өөрийн CV-г оруулах",
    description: "Та өөрийн CV-г PDF/Word файлаар оруулах боломжтой.",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/6eb0c7b65db9c513545528042e8dbb594ce15bf1?placeholderIfAbsent=true",
    title: "Илгээх",
    description:
      "Өөрийн CV-гээ илгээснээр хэсэг хугацааны дараа таны CV-г боловсруулж дуусна",
  },
];

const ProcessIcon = () => (
  <div className="my-4 lg:hidden">
    <img
      src="/icons/mobile.svg"
      alt="Arrow"
      className="w-8 h-8 object-contain"
    />
  </div>
);

const ProcessArrow = () => (
  <div className="hidden lg:flex items-center justify-center mx-4">
    <img
      src="/icons/arrow.svg"
      alt="Arrow"
      className="w-8 h-8 object-contain"
    />
  </div>
);

const ProcessStep = ({ icon, title, description }: ProcessStep) => (
  <div className="flex flex-col items-center w-full lg:w-60 mx-2 flex-shrink-0">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-sm mb-3 transition-shadow duration-300 hover:shadow-md">
      {icon === "AI" ? (
        <span className="text-[#0C213A] text-xl font-semibold">AI</span>
      ) : (
        <img src={icon} className="w-8 h-8 object-contain" alt={title} />
      )}
    </div>
    <h3 className="text-xl font-bold text-[#0C213A] text-center mb-1">
      {title}
    </h3>
    <p className="text-base text-gray-600 text-center leading-relaxed font-thin max-w-[300px]">
      {description}
    </p>
  </div>
);

export default function ProcessSection() {
  return (
    <section className="w-full bg-white min-h-[93vh] flex items-center px-4 2xl:px-16 lg:px-32 py-16 md:py-20 lg:py-0">
      <div className="w-full">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-[#0C213A] text-center mb-12 md:mb-16 lg:mb-16 2xl:mb-30">
          Өөрийн CV-д хэрхэн дүн шинжилгээ <br />
          хийлгэх вэ?
        </h2>
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-16 lg:gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col lg:flex-row items-center">
              <ProcessStep {...step} />
              {idx < steps.length - 1 && (
                <>
                  <ProcessIcon />
                  <ProcessArrow />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
