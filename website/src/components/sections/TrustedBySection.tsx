const companies = ["SignFlow", "CloudSync", "NotionKit", "DataStream", "NotionKit", "DataStream", "SignFlow", "CloudSync"];

export default function TrustedBySection() {
  return (
    <section className="pb-24 pt-16">
      <div className="mx-auto max-w-4xl text-center">
        <h3 className="text-[2.9rem] leading-tight text-[#E8E8EA] md:text-[3.4rem]">Trusted by developers at leading companies</h3>
        <p className="mt-3 text-[2.1rem] text-[#7f7f83]">Used by developers at</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-8 gap-y-10 text-center md:grid-cols-4">
        {companies.map((name, index) => (
          <div key={`${name}-${index}`} className="text-[2.4rem] leading-none text-[#E8E8EA] md:text-[2.9rem]">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
