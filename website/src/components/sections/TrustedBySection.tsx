const companies = ["SignFlow", "CloudSync", "NotionKit", "DataStream", "NotionKit", "DataStream", "SignFlow", "CloudSync"];

export default function TrustedBySection() {
  return (
    <section className="pb-16 pt-8">
      <div className="mx-auto max-w-4xl text-center">
        <h3 className="text-[1.3rem] leading-tight text-[#E8E8EA] md:text-[1.7rem]">Trusted by developers at leading companies</h3>
        <p className="mt-1.5 text-[0.8rem] text-[#7f7f83]">Used by developers at</p>
      </div>

      <div className="mx-auto mt-7 grid max-w-5xl grid-cols-2 gap-x-7 gap-y-6 text-center md:grid-cols-4">
        {companies.map((name, index) => (
          <div key={`${name}-${index}`} className="text-[0.95rem] leading-none text-[#E8E8EA] md:text-[1.08rem]">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
