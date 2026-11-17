import studentPhoto from '@/assets/college-student-lms.png.asset.json'

// Photo layers preserve the supplied character while adding a scroll-driven gait.
export default function RoadmapStudent({ running }) {
  return (
    <div className={`roadmap-photo-student${running ? ' is-walking' : ''}`} data-scene-ready="true">
      <div className="roadmap-photo-body">
        <img className="roadmap-photo-upper" src={studentPhoto.url} alt="" draggable={false} />
        <img className="roadmap-photo-leg roadmap-photo-leg-left" src={studentPhoto.url} alt="" draggable={false} />
        <img className="roadmap-photo-leg roadmap-photo-leg-right" src={studentPhoto.url} alt="" draggable={false} />
      </div>
    </div>
  )
}