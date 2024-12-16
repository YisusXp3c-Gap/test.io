function saveBookmarks(bookmarks) {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateRunbookStorage(bookmarks);
}

function getBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    return bookmarks;
}

function addBookmark(event) {
    event.preventDefault();
    const titleInput = document.getElementById('titleInput');
    const urlInput = document.getElementById('urlInput');
    const categoryInput = document.getElementById('categoryInput');

    const bookmark = {
        id: Date.now(),
        title: titleInput.value,
        url: urlInput.value,
        category: categoryInput.value || 'Uncategorized',
        extraData: null
    };

    const bookmarks = getBookmarks();
    bookmarks.push(bookmark);
    saveBookmarks(bookmarks);

    titleInput.value = '';
    urlInput.value = '';
    categoryInput.value = '';

    const modal = bootstrap.Modal.getInstance(document.getElementById('addBookmarkModal'));
    modal.hide();

    displayBookmarks();
}

function displayBookmarks(bookmarks = getBookmarks()) {
    const bookmarksList = document.getElementById('bookmarksList');
    bookmarksList.innerHTML = '';

    const categories = {};

    bookmarks.forEach(bookmark => {
        if (!categories[bookmark.category]) {
            categories[bookmark.category] = [];
        }
        categories[bookmark.category].push(bookmark);
    });

    for (const category in categories) {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');
        categoryHeader.innerHTML = `
            <h3>${category}</h3>
            <div>
                <button class="btn btn-sm btn-light edit-category me-2">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-light toggle-category">
                    <i class="bi-chevron-down"></i>
                </button>
            </div>
        `;
        categoryContainer.appendChild(categoryHeader);

        const categoryContent = document.createElement('div');
        categoryContent.classList.add('category-content');

        categories[category].forEach(bookmark => {
            const bookmarkElement = document.createElement('div');
            bookmarkElement.classList.add('bookmark-item');
            bookmarkElement.innerHTML = `
                <a href="${bookmark.url}" class="bookmark-title" target="_blank" title="${bookmark.title}">${bookmark.title}</a>
                <button class="action-toggle">⋮</button>
                <div class="bookmark-actions">
                    <button class="btn btn-sm btn-outline-primary edit-bookmark" data-id="${bookmark.id}" title="Edit bookmark">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info add-extra-data" data-id="${bookmark.id}" title="Add related reference">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary view-details" data-id="${bookmark.id}" title="View related cases">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-bookmark" data-id="${bookmark.id}" title="Delete bookmark">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            categoryContent.appendChild(bookmarkElement);
        });

        categoryContainer.appendChild(categoryContent);
        bookmarksList.appendChild(categoryContainer);
    }

    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', toggleCategory);
    });

    document.querySelectorAll('.action-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const actions = e.target.nextElementSibling;
            const allActions = document.querySelectorAll('.bookmark-actions');
            const allToggles = document.querySelectorAll('.action-toggle');
            
            // Cerrar todos los menús de acciones abiertos
            allActions.forEach(action => action.style.display = 'none');
            allToggles.forEach(toggle => toggle.classList.remove('active'));
            
            // Abrir o cerrar el menú de acciones actual
            if (actions.style.display === 'flex') {
                actions.style.display = 'none';
                e.target.classList.remove('active');
            } else {
                actions.style.display = 'flex';
                e.target.classList.add('active');
            }
        });
    });
}

function deleteBookmark(id) {
    let bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
    saveBookmarks(bookmarks);
    displayBookmarks();
}

function editBookmark(id) {
    const bookmarks = getBookmarks();
    const bookmark = bookmarks.find(b => b.id === id);
    
    if (bookmark) {
        document.getElementById('editBookmarkId').value = bookmark.id;
        document.getElementById('editTitleInput').value = bookmark.title;
        document.getElementById('editUrlInput').value = bookmark.url;
        document.getElementById('editCategoryInput').value = bookmark.category;
        
        const editModal = new bootstrap.Modal(document.getElementById('editBookmarkModal'));
        editModal.show();
    }
}

function saveEditedBookmark(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('editBookmarkId').value);
    const title = document.getElementById('editTitleInput').value;
    const url = document.getElementById('editUrlInput').value;
    const category = document.getElementById('editCategoryInput').value;

    let bookmarks = getBookmarks();
    const index = bookmarks.findIndex(b => b.id === id);
    
    if (index !== -1) {
        bookmarks[index] = { ...bookmarks[index], title, url, category };
        saveBookmarks(bookmarks);
        displayBookmarks();
    }

    const editModal = bootstrap.Modal.getInstance(document.getElementById('editBookmarkModal'));
    editModal.hide();
}

function searchBookmarks(event) {
    const searchTerm = event.target.value.toLowerCase();
    const bookmarks = getBookmarks();
    const filteredBookmarks = bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm) || 
        bookmark.category.toLowerCase().includes(searchTerm)
    );
    displayBookmarks(filteredBookmarks);
}

function editCategory(oldCategory) {
    document.getElementById('oldCategoryName').value = oldCategory;
    document.getElementById('newCategoryName').value = oldCategory;
    const editCategoryModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    editCategoryModal.show();
}

function saveEditedCategory(event) {
    event.preventDefault();
    const oldCategory = document.getElementById('oldCategoryName').value;
    const newCategory = document.getElementById('newCategoryName').value;

    let bookmarks = getBookmarks();
    bookmarks = bookmarks.map(bookmark => 
        bookmark.category === oldCategory ? {...bookmark, category: newCategory} : bookmark
    );
    saveBookmarks(bookmarks);

    const editCategoryModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
    editCategoryModal.hide();

    displayBookmarks();
}

function addExtraData(id) {
    const bookmarks = getBookmarks();
    const bookmark = bookmarks.find(b => b.id === id);
    
    if (bookmark) {
        document.getElementById('extraDataBookmarkId').value = bookmark.id;
        document.getElementById('caseNumberInput').value = '';
        document.getElementById('issueSolvedInput').value = '';
        document.getElementById('notesInput').value = '';
        
        const addExtraDataModal = new bootstrap.Modal(document.getElementById('addExtraDataModal'));
        addExtraDataModal.show();
    }
}

function saveExtraData(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('extraDataBookmarkId').value);
    const caseNumber = document.getElementById('caseNumberInput').value;
    const issueSolved = document.getElementById('issueSolvedInput').value;
    const notes = document.getElementById('notesInput').value;

    let bookmarks = getBookmarks();
    const index = bookmarks.findIndex(b => b.id === id);
    
    if (index !== -1) {
        if (!bookmarks[index].extraData) {
            bookmarks[index].extraData = { notes: [] };
        }
        bookmarks[index].extraData.notes.push({
            id: Date.now(),
            caseNumber: caseNumber,
            issueSolved: issueSolved,
            text: notes
        });
        saveBookmarks(bookmarks);
        displayBookmarks();
    }

    document.getElementById('caseNumberInput').value = '';
    document.getElementById('issueSolvedInput').value = '';
    document.getElementById('notesInput').value = '';

    const addExtraDataModal = bootstrap.Modal.getInstance(document.getElementById('addExtraDataModal'));
    addExtraDataModal.hide();
}

let workbook = null;

function updateRunbookStorage(bookmarks) {
    let workbook;
    try {
        workbook = XLSX.readFile('Runbook Storage.xlsx');
    } catch (error) {
        workbook = XLSX.utils.book_new();
        workbook.Props = {
            Title: "Runbook Storage",
            Subject: "Bookmark Knowledge Base",
            Author: "Knowledge Base Storage App",
            CreatedDate: new Date()
        };
    }

    const categories = {};
    bookmarks.forEach(bookmark => {
        if (!categories[bookmark.category]) {
            categories[bookmark.category] = [];
        }
        categories[bookmark.category].push(bookmark);
    });

    for (const category in categories) {
        const ws_data = [['Title', 'URL']];
        categories[category].forEach(bookmark => {
            ws_data.push([bookmark.title, bookmark.url]);
        });
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        if (workbook.SheetNames.includes(category)) {
            workbook.Sheets[category] = ws;
        } else {
            XLSX.utils.book_append_sheet(workbook, ws, category);
        }
    }

    const related_cases_data = [['Category', 'Title', 'Case/Incident Number', 'Issue Solved', 'Notes']];
    bookmarks.forEach(bookmark => {
        if (bookmark.extraData && bookmark.extraData.notes) {
            bookmark.extraData.notes.forEach(note => {
                related_cases_data.push([
                    bookmark.category,
                    bookmark.title,
                    note.caseNumber,
                    note.issueSolved,
                    note.text
                ]);
            });
        }
    });
    const related_cases_ws = XLSX.utils.aoa_to_sheet(related_cases_data);
    
    related_cases_ws['!autofilter'] = { ref: "A1:E1" };

    if (workbook.SheetNames.includes('Related Cases')) {
        workbook.Sheets['Related Cases'] = related_cases_ws;
    } else {
        XLSX.utils.book_append_sheet(workbook, related_cases_ws, 'Related Cases');
    }

    XLSX.writeFile(workbook, 'Runbook Storage.xlsx');
}

function viewBookmarkDetails(id) {
    const bookmarks = getBookmarks();
    const bookmark = bookmarks.find(b => b.id === id);
    
    if (bookmark) {
        const detailsWindow = window.open('', '_blank');
        detailsWindow.document.write(`
            <html>
            <head>
                <title>Bookmark Details</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; }
                    table { width: 100%; margin-top: 20px; }
                    th { background-color: #f8f9fa; }
                </style>
            </head>
            <body>
                <h1>Bookmark Details</h1>
                <table class="table table-bordered">
                    <tr><th>Title</th><td>${bookmark.title}</td></tr>
                    <tr><th>URL</th><td><a href="${bookmark.url}" target="_blank">${bookmark.url}</a></td></tr>
                    <tr><th>Category</th><td>${bookmark.category}</td></tr>
                    ${bookmark.extraData ? `
                        <tr><th>Related Cases</th><td>
                            ${bookmark.extraData.notes.map(note => `
                                <div>
                                    <strong>Case/Incident Number:</strong> ${note.caseNumber}<br>
                                    <strong>Issue Solved:</strong> ${note.issueSolved}<br>
                                    <strong>Notes:</strong> ${note.text}
                                    <button class="btn btn-sm btn-danger delete-note" data-bookmark-id="${bookmark.id}" data-note-id="${note.id}">Delete</button>
                                </div>
                            `).join('<hr>')}
                        </td></tr>
                    ` : ''}
                </table>
                <script>
                    document.querySelectorAll('.delete-note').forEach(button => {
                        button.addEventListener('click', function() {
                            const bookmarkId = this.getAttribute('data-bookmark-id');
                            const noteId = this.getAttribute('data-note-id');
                            window.opener.deleteNote(bookmarkId, noteId);
                            this.closest('div').remove();
                        });
                    });
                </script>
            </body>
            </html>
        `);
    }
}

function deleteNote(bookmarkId, noteId) {
    let bookmarks = getBookmarks();
    const bookmarkIndex = bookmarks.findIndex(b => b.id === parseInt(bookmarkId));
    if (bookmarkIndex !== -1) {
        bookmarks[bookmarkIndex].extraData.notes = bookmarks[bookmarkIndex].extraData.notes.filter(note => note.id !== parseInt(noteId));
        saveBookmarks(bookmarks);
    }
}

function toggleCategory(event) {
    if (event.target.classList.contains('edit-category') || event.target.closest('.edit-category')) {
        return;
    }
    const categoryContainer = event.currentTarget.closest('.category-container');
    const categoryContent = categoryContainer.querySelector('.category-content');
    const icon = categoryContainer.querySelector('.toggle-category i');

    if (categoryContent.classList.contains('minimized')) {
        categoryContent.classList.remove('minimized');
        icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
        categoryContent.style.maxHeight = categoryContent.scrollHeight + "px";
    } else {
        categoryContent.classList.add('minimized');
        icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
        categoryContent.style.maxHeight = "0";
    }
}

function toggleAllCategories() {
    const allCategories = document.querySelectorAll('.category-content');
    const allIcons = document.querySelectorAll('.toggle-category i');
    const isAnyExpanded = Array.from(allCategories).some(category => !category.classList.contains('minimized'));

    allCategories.forEach((category, index) => {
        if (isAnyExpanded) {
            category.classList.add('minimized');
            category.style.maxHeight = "0";
            allIcons[index].classList.replace('bi-chevron-up', 'bi-chevron-down');
        } else {
            category.classList.remove('minimized');
            category.style.maxHeight = category.scrollHeight + "px";
            allIcons[index].classList.replace('bi-chevron-down', 'bi-chevron-up');
        }
    });
}

document.getElementById('bookmarkForm').addEventListener('submit', addBookmark);
document.getElementById('editBookmarkForm').addEventListener('submit', saveEditedBookmark);
document.getElementById('editCategoryForm').addEventListener('submit', saveEditedCategory);
document.getElementById('extraDataForm').addEventListener('submit', saveExtraData);
document.getElementById('searchInput').addEventListener('input', searchBookmarks);
document.getElementById('addBookmarkBtn').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('addBookmarkModal'));
    modal.show();
});
document.getElementById('toggleAllBtn').addEventListener('click', toggleAllCategories);

document.getElementById('bookmarksList').addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-bookmark') || e.target.closest('.edit-bookmark')) {
        const id = e.target.closest('.edit-bookmark').dataset.id;
        editBookmark(parseInt(id));
    } else if (e.target.classList.contains('delete-bookmark') || e.target.closest('.delete-bookmark')) {
        const id = e.target.closest('.delete-bookmark').dataset.id;
        if (confirm('Are you sure you want to delete this bookmark?')) {
            deleteBookmark(parseInt(id));
        }
    } else if (e.target.classList.contains('add-extra-data') || e.target.closest('.add-extra-data')) {
        const id = e.target.closest('.add-extra-data').dataset.id;
        addExtraData(parseInt(id));
    } else if(e.target.classList.contains('edit-category') || e.target.closest('.edit-category')) {
        const categoryName = e.target.closest('.category-container').querySelector('h3').textContent;
        editCategory(categoryName);
    } else if (e.target.classList.contains('view-details') || e.target.closest('.view-details')) {
        const id = e.target.closest('.view-details').dataset.id;
        viewBookmarkDetails(parseInt(id));
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.action-toggle') && !e.target.closest('.bookmark-actions')) {
        document.querySelectorAll('.bookmark-actions').forEach(action => action.style.display = 'none');
        document.querySelectorAll('.action-toggle').forEach(toggle => toggle.classList.remove('active'));
    }
});

displayBookmarks();

