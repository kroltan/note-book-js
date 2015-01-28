/**
 * A simple controller for a notes widget with search functionality.
 * @constructor
 * @param {HTMLElement} content The root element to initialize this into.
 *                              Must contain exactly one element with each class:
 *                              "search-field","notes-container" and "new-note".
 */
function NotesWidget(element) {
    this.noop = function(i) { return true; };
    this.element = element;
    this.container = element.querySelector(".notes-container")
    this.notes = [];

    var self = this;
    var searchBar = element.querySelector(".search-field");
    var newNoteBtn = element.querySelector(".new-note");
    searchBar.addEventListener("input", function(evt) {
        var searchString = searchBar.value.toLowerCase();
        self.filterNotes();
    });
    newNoteBtn.addEventListener("click", function(evt) {
        self.addNote("");
    })

    this.filterNotes(this.noop);
}
NotesWidget.prototype = {
    /**
     * Adds a new note to the list
     * @instance
     * @param {String} content The note's text
     * @return {Number} The just created note's identifier
     */
    addNote: function(content) {
        var identifier = this.notes.reduce(function(accumulator, item) {
            return accumulator + item.id;
        }, 1);
        
        this.notes.push({
            id: identifier,
            content: content || ""
        });

        this.filterNotes();

        return identifier;
    },

    /**
     * Returns the note with the given identifier's content
     * @param  {Integer} identifier The note's identifier
     * @return {String}             The note's content
     */
    getNote: function(identifier) {
        return this.notes.filter(function(item) {
            return item.id === identifier;
        })[0].content;
    },

    /**
     * Removes a note given its identifier
     * @param  {Number} identifier The note's identifier
     */
    removeNote: function(identifier) {
        this.notes = this.notes.filter(function(item) {
            return item.id !== identifier;
        });
        this.filterNotes();
    },

    /**
     * Updates a note's content
     * @param {Number} identifier The note's identifier
     * @param {String} content The new content of the note
     */
    setContent: function(identifier, content) {
        var found = false;
        this.notes.forEach(function(item) {
            if (item.id === identifier) {
                item.content = content;
                found = true;
            }
        });
        this.filterNotes();
        if (!found) throw new Error("Failed setting content: no such note " + identifier);
    },

    /**
     * Displays the notes on the page, according to the supplied filter function
     * If no filter is passed, will use the last filter used.
     * @param  {Function} filterFunc A function that will be called with a note's content,
     *                               must return true if the note should be displayed, 
     *                               false otherwise.
     * @return {Array} Result of the filtering, which notes are visible.
     */
    filterNotes: function(filterFunc) {
        var self = this;

        var filterFunction = filterFunc || this.filterFunction;
        var visibleNotes = this.notes.filter(function(note){
            var normalizedContent = note.content.toLowerCase();
            return filterFunction(normalizedContent);
        });

        //remove all elements
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        //re-add relevant elements
        var self = this;
        visibleNotes.forEach(function(note) {
            var element = self.createNoteElement(note.id, note.content);
            self.container.appendChild(element);
        });

        return visibleNotes;
    },

    /**
     * Creates a comple element for a note, including data binding and closing.
     * @param  {Integer} identifier The array index on this widget's notes list
     * @param {String} content The initial content of this note
     * @return {HTMLElement} The element
     */
    createNoteElement: function(identifier, content) {
        function createWithClass(name, className) {
            var element = document.createElement(name);
            element.classList.add(className);
            return element;
        }
        var self = this;
        var note = createWithClass("div", "note");
        var contentArea = createWithClass("textarea", "note-content");
        var closeButton = createWithClass("div", "note-close");

        contentArea.value = content || "";
        contentArea.setAttribute("data-id", identifier);
        contentArea.addEventListener("blur", function(evt) {
            self.setContent(identifier, contentArea.value);
        });
        //TODO: Remove remove note when close button is clicked
        //tip: "click" event listener

        note.appendChild(contentArea);
        note.appendChild(closeButton);

        return note;
    },
    /**
     * Remove all notes from record, resets filter.
     */
    clear: function() {
        this.notes.splice(0);
        this.filterNotes(this.noop);
    }
};
