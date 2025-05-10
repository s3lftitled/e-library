const ProgramSearch = ({ isDarkMode, searchQuery, setSearchQuery, searchResults, handleResultClick }) => {
  return (
    <div className={`search-div ${isDarkMode ? 'dark-mode' : ''}`}>
      <input
        placeholder="Search"
        className={`search-input ${isDarkMode ? 'dark-mode' : ''}`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </button>
      {searchQuery && searchResults && (
        <ul className={`search-results ${isDarkMode ? 'dark-mode' : ''}`}>
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <li key={result._id} onClick={() => handleResultClick(result)}>
                {result.title}
              </li>
            ))
          ) : (
            <li>No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ProgramSearch;