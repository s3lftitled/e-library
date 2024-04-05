const toggleBookmark = async (materialID, addToBookShelf, bookshelf, setBookshelf) => {
  if (bookshelf.includes(materialID)) {
    setBookmarks(bookmarks.filter((id) => id !== materialID))
  } else {
    await addToBookShelf(materialID)
    setBookmarks([...bookshelf, materialID])
  }
}

export default toggleBookmark