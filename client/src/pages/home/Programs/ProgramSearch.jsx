const ProgramSearch = ({ searchQuery, setSearchQuery, searchResults, handleResultClick }) => {
  return (
      <div className="search-div">
        <input
          placeholder="Search"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <img src="search.svg" className="search-icon" alt="search" />
        {searchQuery && (
          <ul className="search-results">
            { searchResults.length > 0 ? (
              searchResults.map((result) => (
                <li key={result._id} onClick={() => handleResultClick(result)}>
                  {result.title}
                </li>
              ))
              ) : (
                <p>No results found</p>
              )
            }
          </ul>
        )}
      </div>
  )
}

export default ProgramSearch

