const ProgramCard = ({ program, onClick }) => (
  <div className="program-card" onClick={onClick}>
    <div className="book-img-div">
      <img className="book-img" src="book.png" alt="books" />
    </div>
    <div className="program-details">
      <h1 className="program-title">{program.title}</h1>
      <p className="program-description">{program.description}</p>
    </div>
  </div>
)

export default ProgramCard
