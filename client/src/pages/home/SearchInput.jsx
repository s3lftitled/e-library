export const SearchInput = () => {
  return (
    <div className="search-div">
      <input 
        placeholder="Search for a program"
        className="search-input"
      />
      <img src='search.svg' className="search-icon"/>
    </div>
  )
}