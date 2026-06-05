const tags = [
  'Team offsites', "Founders' day gifts", 'Client experiences',
  'Onsite pop-ups', 'Reception-wall pieces', 'Diversity week activities',
  'Annual offsites', 'Team offsites', "Founders' day gifts", 'Client experiences',
  'Onsite pop-ups', 'Reception-wall pieces', 'Diversity week activities', 'Annual offsites',
]

export default function UseCases() {
  return (
    <div className="usecases">
      <div className="usecases-track">
        {tags.map((tag, i) => (
          <span className="usecase-tag" key={i}>{tag}</span>
        ))}
      </div>
    </div>
  )
}
