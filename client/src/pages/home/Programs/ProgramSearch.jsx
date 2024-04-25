const ProgramSearch = ({ isDarkMode, searchQuery, setSearchQuery, searchResults, handleResultClick }) => {
  return (
    <div className={`search-div ${isDarkMode ? 'dark-mode' : ''}`}>
      <input
        placeholder="Search"
        className={`search-input ${isDarkMode ? 'dark-mode' : ''}`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <img src="search.svg" className={`search-icon ${isDarkMode ? 'dark-mode' : ''}`} alt="search" />
      {searchQuery && (
        <ul className={`search-results ${isDarkMode ? 'dark-mode' : ''}`}>
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <li key={result._id} onClick={() => handleResultClick(result)}>
                {result.title}
              </li>
            ))
          ) : (
            <p>No results found</p>
          )}
        </ul>
      )}
    </div>
  )
}

export default ProgramSearch