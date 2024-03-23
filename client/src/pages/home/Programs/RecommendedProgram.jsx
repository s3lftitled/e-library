const RecommendedProgram = ({ program, onClick }) => (
  <div className="recommended-programs">
    <div className="program-card recommended-program" onClick={onClick}>
      <div className="book-img-div">
        <img className="book-img" src="book.png" alt="books" />
      </div>
      <div className="program-details">
        <p className="program-title">{program.title}</p>
        <p className="program-description">{program.description}</p>
      </div>
    </div>
  </div>
)

export default RecommendedProgram

