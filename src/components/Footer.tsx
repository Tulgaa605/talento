export const Footer = () => {
  return (
    <footer className="flex flex-col items-center w-full bg-zinc-900 max-md:max-w-full">
      <div className="py-24 max-w-full w-[1320px]">
        <div className="flex gap-5 max-md:flex-col">
          <div className="w-3/12 max-md:ml-0 max-md:w-full">
            <div className="flex flex-col w-full max-md:mt-10">
              <div className="flex gap-2 items-center self-start text-2xl font-semibold leading-loose text-white whitespace-nowrap">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/e8ef59d2165f2d75fa10e303ea8724b5942aee73?placeholderIfAbsent=true"
                  className="object-contain shrink-0 self-stretch my-auto w-10 aspect-square"
                  alt=""
                />
                <span>Talento</span>
              </div>
              <div className="flex flex-col mt-6 w-full max-w-[312px]">
                <div className="flex items-start self-start text-lg leading-loose">
                  <span className="text-gray-500">Call now:</span>
                  <span className="font-medium text-white">(319) 555-0115</span>
                </div>
                <address className="mt-3 text-sm leading-5 text-gray-500 not-italic">
                  6391 Elgin St. Celina, Delaware 10299, New York, United States
                  of America
                </address>
              </div>
            </div>
          </div>
          <nav className="ml-5 w-9/12 max-md:ml-0 max-md:w-full">
            <div className="z-10 grow max-md:mt-10 max-md:-mr-0.5 max-md:max-w-full">
              <div className="flex gap-5 max-md:flex-col">
                {[
                  {
                    title: "Quick Link",
                    links: ["About", "Contact", "Pricing", "Blog"],
                  },
                  {
                    title: "Candidate",
                    links: [
                      "Browse Jobs",
                      "Browse Employers",
                      "Candidate Dashboard",
                      "Saved Jobs",
                    ],
                  },
                  {
                    title: "Employers",
                    links: [
                      "Post a Job",
                      "Browse Candidates",
                      "Employers Dashboard",
                      "Applications",
                    ],
                  },
                  {
                    title: "Support",
                    links: ["Faqs", "Privacy Policy", "Terms & Conditions"],
                  },
                ].map((section, index) => (
                  <div key={index} className="w-3/12 max-md:ml-0 max-md:w-full">
                    <div className="flex flex-col grow max-md:mt-10">
                      <h3 className="text-xl font-medium leading-relaxed text-white">
                        {section.title}
                      </h3>
                      <ul className="flex flex-col items-start self-start mt-4 text-base text-center text-gray-400">
                        {section.links.map((link, linkIndex) => (
                          <li
                            key={linkIndex}
                            className="gap-1 self-stretch py-1.5 mt-1 first:mt-0"
                          >
                            <a href="#" className="hover:text-white">
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
      <div className="flex flex-wrap gap-10 justify-between items-center px-72 py-6 w-full shadow-sm bg-zinc-900 max-md:px-5 max-md:max-w-full">
        <p className="self-stretch my-auto text-sm leading-none text-gray-500">
          @ 2021 Jobpilot - Job Portal. All rights Rserved
        </p>
        <div className="flex gap-5 items-start self-stretch my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/8c5735787836ff02d612ee67cd1f03a00dc44afd?placeholderIfAbsent=true"
            className="object-contain shrink-0 w-2.5 aspect-[0.5] fill-gray-500"
            alt="Social media"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/732cf34f10fb8b507212bb43d15ee39b742fbb57?placeholderIfAbsent=true"
            className="object-contain shrink-0 w-5 aspect-square"
            alt="Social media"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/f1bac6ee86d0d9f84597793e1f5726eca59d12e8?placeholderIfAbsent=true"
            className="object-contain shrink-0 w-5 aspect-square"
            alt="Social media"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/280cc3dbf4da709d515b421df19f9158d215a811?placeholderIfAbsent=true"
            className="object-contain shrink-0 w-5 aspect-square"
            alt="Social media"
          />
        </div>
      </div>
    </footer>
  );
};
