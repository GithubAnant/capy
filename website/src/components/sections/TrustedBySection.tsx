const companies = ["SignFlow", "CloudSync", "NotionKit", "DataStream", "NotionKit", "DataStream", "SignFlow", "CloudSync"];

export default function TrustedBySection() {
  return (
    <section className="pb-20 pt-10">
      <div className="mx-auto max-w-4xl text-center">
        <h3 className="text-[1.6rem] leading-tight text-[#E8E8EA] md:text-[2.1rem]">Trusted by developers at leading companies</h3>
        <p className="mt-2 text-[0.95rem] text-[#7f7f83]">Used by developers at</p>
      </div>

      <div className="mx-auto mt-9 grid max-w-5xl grid-cols-2 gap-x-8 gap-y-7 text-center md:grid-cols-4">
        {companies.map((name, index) => (
          <div key={`${name}-${index}`} className="text-[1.15rem] leading-none text-[#E8E8EA] md:text-[1.35rem]">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
