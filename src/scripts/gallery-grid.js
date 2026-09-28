/*
*   (DO NOT REMOVE THIS HEADER)
*
*   Gallery Grid (v.1.4.1)
*   Author: espimyte (https://espy.world)
*   https://espy.world/gallery-grid
*/

var stylePath = "/styles/gallery-grid.css";
var smallScreenWidth = 600;
var disableShortcuts = false;

const Defaults = {
    GRID_TYPE: "fixed",

    CELL_WIDTH: 250,
    CELL_HEIGHT: 250,

    MAX_ROW_HEIGHT: 500,

    MAX_PER_PAGE: undefined,
    PAGENAV_DISPLAY: "bottom",

    CAPTIONS: "disabled",

    FILTERS: "none",
    SORT: "none",
}

const Keybinds = {
    NAV_LEFT: 'ArrowLeft',
    NAV_RIGHT: 'ArrowRight',
    RANDOM: 'r'
}

const VALID_GRIDTYPES = ["fixed", "justified"];
const VALID_CAPTIONS = ["always", "disabled", "smallscreen"];
const VALID_FILTERS = ["tags", "none"];
const VALID_SORTS = ["default", "alphabetical", "none"];
const VALID_PAGENAV_DISPLAY = ["bottom", "top", "both"];

const STYLE_LOAD_EVENT_NAME = "ggstyleload";
const styleLoadEvent = new Event(STYLE_LOAD_EVENT_NAME);

main();

class Lightbox {
    static lightboxEl = document.getElementById("lb");
    static titleEl = document.getElementById("lb_title");
    static descEl = document.getElementById("lb_desc");
    static infoEl = document.getElementById("lb_info");
    static tagsEl = document.getElementById("lb_tags");

    static imgWrapperEl = document.getElementById("lb_imageWrapper");
    static imgEl = document.getElementById("lb_image");
    static loadingEl = document.getElementById("lb_loading");

    static exitButton = document.getElementById("lb_exitButton");
    static smallExitButton = document.getElementById("lb_smallExitButton");

    static title;
    static desc;
    static tags;
    static img;
    static imgHeight;
    static imgWidth;
    static imgScale = 1;

    static lightboxOpenEvent = new Event("lightboxopen");
    static lightboxCloseEvent = new Event("lightboxclose");

    static disabled = false;
    static smallScreenEnabled = true;
    static opened = false;

    static {
        this.exitButton.onclick = function () {Lightbox.close()};
        this.smallExitButton.onclick = function () {Lightbox.close()};

        addEventListener("resize", function() {
            if (Lightbox.isSmallScreen() && !Lightbox.smallScreenEnabled) {
                Lightbox.close();
            }
        })
    }

    static openWith(data) {
        this.set(data);
        this.open();
    }

    static set({title, desc, alt, tags, img, render, noframe, imgWidth, imgHeight, imgScale = 1, hidenav = false}) {
        if (this.disabled) return;
        if (this.isSmallScreen() && !this.smallScreenEnabled) return;

        this.title = title;
        this.desc = desc;
        this.tags = tags;
        this.img = img;
        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.imgScale = imgScale;

        this.titleEl.innerHTML = title;
        this.descEl.innerHTML = desc;

        this.tagsEl.innerHTML = "";
        if (tags) {
            for (let tag of tags) {
                const tagEl = document.createElement("span");
                tagEl.textContent = tag.toUpperCase();
                this.tagsEl.appendChild(tagEl);
            }
        }


        this.imgEl.src = "";

        if (alt) {
            this.imgEl.style.opacity = 1;
            this.imgEl.alt = alt;
        } else {
            this.imgEl.style.opacity = 0;
            this.imgEl.removeAttribute("alt");
        }
        
        this.imgEl.src = img;
        this.imgEl.style.imageRendering = render ? render : undefined;

        if (noframe) this.imgWrapperEl.classList.add("lb-noframe");
        else this.imgWrapperEl.classList.remove("lb-noframe");

        if (hidenav) this.lightboxEl.classList.add("lb-hidenav");
        else this.lightboxEl.classList.remove("lb-hidenav");
    }

    static open() {
        if (this.disabled) return;
        if (this.isSmallScreen() && !this.smallScreenEnabled) return;

        dispatchEvent(this.lightboxOpenEvent);

        this.titleEl.style.display = this.title ? "block" : "none";
        this.descEl.style.display = this.desc ? "block" : "none";
        this.tagsEl.style.display = this.tags ? "flex" : "none";
        this.infoEl.style.display = this.title || this.desc || this.tags ? "flex" : "none";
        this.lightboxEl.style.display = "block";

        this.lightboxEl.classList.add("lb-open");
        this.opened = true;

        let heightBuffer = this.infoEl.offsetHeight;
        if (this.isSmallScreen()) heightBuffer += 120;

        this.imgWrapperEl.style.maxHeight = `calc(100% - ${heightBuffer}px)`;
        this.imgEl.style.width = '500px';
        this.imgEl.style.height = '500px';

        this.loadingEl.style.transition = "opacity 0.1s";
        this.loadingEl.style.opacity = "1";

        this.imgEl.onload = () => {
            this.imgEl.style.opacity = 1;
            this.loadingEl.style.opacity = "0";
            this.loadingEl.style.transition = "";
            if (this.imgScale != 1) {
                this.imgEl.style.width = `${this.imgEl.naturalWidth * this.imgScale}px`;
                this.imgEl.style.height = `${this.imgEl.naturalHeight * this.imgScale}px`;
            } else {
                this.imgEl.style.width = '';
                this.imgEl.style.height = '';
            }
            this.imgEl.style.aspectRatio = `${this.imgEl.naturalWidth} / ${this.imgEl.naturalHeight}`;
        }
    }

    static close() {
        dispatchEvent(this.lightboxCloseEvent);
        this.lightboxEl.style.display = "none";
        this.lightboxEl.classList.remove("lb-open");
        this.opened = false;
    }

    static getImgSource(imgSrc) {
        return imgSrc;
    }
    
    static isSmallScreen() {
        return (window.innerWidth <= smallScreenWidth);
    }

    static setOnLightboxOpenEvent(lambda) {
        addEventListener("lightboxopen", () => lambda());
    }

    static setOnLightboxCloseEvent(lambda) {
        addEventListener("lightboxclose", () => lambda());
    }

    static disable() {
        this.close();
        this.disabled = true;
    }

    static enable() {
        this.disabled = false;
    }

    static setSmallScreenEnabled(smallScreenEnabled) {
        this.smallScreenEnabled = smallScreenEnabled;
    }
}

class GallerySource {
    constructor({id, img, alt, thumb, imgWidth, imgHeight, title, desc, tags, render, thumbRender, scale, noframe, order, element}) {
        this.id = id;
        this.img = img;
        this.thumb = thumb;

        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;

        this.title = title;
        this.desc = desc;
        this.alt = alt;
        this.tags = tags;
        this.scale = scale ?? 1;

        this.render = render;
        this.thumbRender = thumbRender;
        this.noframe = noframe;
        this.order = order;

        this.element = element;
    }

    static fromElement(element, {width, height, order}) {
        let scale = element.getAttribute("scale");
        if (!scale) scale = 1;
        scale = parseFloat(scale);
        if (!scale || scale < 0) {
            console.warn("Invalid scale value for "+element.getAttribute("src"));
            scale = 1;
        }

        let noframe = element.getAttribute("noframe");
        noframe = noframe === null ? false : noframe !== "false";

        return new GallerySource({element, id: element.id, img: element.getAttribute("src"), thumb: element.getAttribute("thumb"), imgWidth: width, imgHeight: height, title: element.getAttribute("title"), desc: element.getAttribute("desc"), tags: element.getAttribute("tags")?.split(","), scale, noframe, order, render: element.getAttribute("render"), thumbRender: element.getAttribute("thumb-render"), alt: element.alt})
    }
}

class Gallery {
    SWIPE_SPEED = 100;
    SWIPE_BUMP_SPEED = 200;

    static fixedCellElementGen = {
        loading: ({}) => {
            let loading = document.createElement("div");
            loading.className = "g-gridCellLoading";
            return loading;
        },
        effect: ({self}) => {
            let effect = document.createElement("div");
            effect.className = "g-gridCellEffect";
            if (!self.smallLightboxEnabled) effect.classList.add("g-smallScreenHide");
            return effect;
        },
        btn: ({self, index}) => {
            let btn = document.createElement("button");
            btn.className = "g-gridCellButton";
            if (!self.smallLightboxEnabled)  btn.classList.add("g-smallScreenHide");
            btn.onclick = () => {
                self.setLightbox(index);
            };
            return btn;
        },
        img: ({source}) => {
            let img = source.element ?? document.createElement("img");
            img.style.display = '';
            img.src = Gallery.getCellImage(source);
            img.className = "g-gridCellImage";
            if (source.thumbRender) img.style.imageRendering = source.thumbRender
            else if (source.render) img.style.imageRendering = source.render;
            return img;
        },
        desc: ({self, source}) => {
            if (self.captions !== "disabled" && source.desc != undefined) {
                let descEl = document.createElement("span");
                descEl.className = "g-gridCellCaption";
                if (self.captions === "smallscreen") descEl.classList.add("g-smallScreen");
                descEl.innerHTML = source.desc;
                return descEl;
            }
        }
    }

    static justifiedCellElementGen = {
        effect: ({self}) => {
            let effect = document.createElement("div");
            effect.className = "g-gridCellEffect rm-pause";
            if (!self.smallLightboxEnabled) effect.classList.add("g-smallScreenHide");
            return effect;
        },
        img: ({source}) => {
            let img = source.element ?? document.createElement("img");
            img.style.display = '';
            img.src = Gallery.getCellImage(source);
            img.className = "g-gridCellImage";

            if (source.thumbRender) img.style.imageRendering = source.thumbRender
            else if (source.render) img.style.imageRendering = source.render;
            return img;
        },
        btn: ({self, index}) => {
            let btn = document.createElement("button");
            btn.className = "g-gridCellButton";
            if (!self.smallLightboxEnabled) btn.classList.add("g-smallScreenHide");
            btn.onclick = function () {
                self.setLightbox(index);
            };
            return btn;
        },
        desc: ({self, source}) => {
            if (self.captions !== "disabled" && source.desc != undefined) {
                let descEl = document.createElement("span");
                descEl.className = "g-gridCellCaption";
                if (self.captions === "smallscreen") descEl.classList.add("g-smallScreen");
                descEl.innerHTML = source.desc;
                return descEl;
            }
        }
    }

    constructor(sources, {
        allowOpenFromRandom = false, 
        smallLightboxEnabled = true,
        captions = Defaults.CAPTIONS,
        hiddenElements,
        extra = {}}) {

        var self = this;

        this.sources = Gallery.sortSources(sources);

        this.curr = -1;

        this.prevButton = document.getElementById("lb_prev");
        this.nextButton = document.getElementById("lb_next");
        this.randButton = document.getElementById("lb_randomButton");
        this.allowOpenFromRandom = allowOpenFromRandom;

        this.gridEl;
        this.maxRowHeight;
        this.smallMaxRowHeight;
        this.refreshGrid = () => {};

        this.focused = false;
        this.smallLightboxEnabled = smallLightboxEnabled;
        this.captions = captions;
        this.hiddenElements = hiddenElements;

        this.setupButtons();
        this.setupShortcuts();
        this.setupListeners();

        for (const [key, value] of Object.entries(extra)) {
            this[key] = value;
        }
        Gallery.onStart(self, extra);
    }

    static onStart(_handler, {}) {}

    static onSourcesChanged(handler, _sources) {
        handler.refreshGrid();
    }

    setLightbox(i) {
        const source = this.sources[i];

        Lightbox.openWith({...source, 
            tags: this.hiddenElements?.includes("tags") ? undefined : source.tags, 
            title: this.hiddenElements?.includes("title") ? undefined : source.title, 
            desc: this.hiddenElements?.includes("desc") ? undefined : source.desc, 
            imgScale: source.scale, hidenav: this.hiddenElements?.includes("nav")})

        this.focused = true;

        this.curr = i;
        this.prevButton.disabled = this.curr == 0;
        this.nextButton.disabled = this.curr == this.sources.length - 1;

        this.prevButton.classList.remove("lb-pressed");
        this.nextButton.classList.remove("lb-pressed");

        if (Lightbox.isSmallScreen()) {
            this.prevButton.style.display = "none";
            this.nextButton.style.display = "none";
        } else {
            this.prevButton.style.display = "block";
            this.nextButton.style.display = "block";
        }
    }

    setLightboxById(id) {
        const index = this.getIndex(id);
        if (index === -1) {
            console.warn("Could not find image with id "+id);
            return;
        }
        this.setLightbox(index);
    }

    getIndex(id) {
        return this.sources.findIndex((vs) => vs.id == id);
    }

    prevLightbox() {
        if (!this.isFirstLightbox()) {
            this.setLightbox(this.curr - 1);
        }
    }

    nextLightbox() {
        if (!this.isLastLightbox()) {
            this.setLightbox(this.curr + 1);
        }
    }

    isFirstLightbox() {
        return this.curr <= 0;
    }

    isLastLightbox() {
        return this.curr >= this.sources.length - 1
    }

    randomLightbox() {
        this.setLightbox(Math.floor(Math.random() * this.sources.length));
    }

    setupButtons() {
        var self = this;

        this.prevButton.addEventListener("click", function () {
            if (self.focused) self.prevLightbox();
        });

        this.nextButton.addEventListener("click", function () {
            if (self.focused) self.nextLightbox();
        }); 

        if (this.randButton) {
            this.randButton.addEventListener("click", function() {
                if (self.focused || self.allowOpenFromRandom) self.randomLightbox();
            }); 
        }
    }

    setupListeners() {
        var self = this;

        Lightbox.setOnLightboxOpenEvent(() => {
            animateX(Lightbox.imgWrapperEl, 0, 0);
        })
        Lightbox.setOnLightboxCloseEvent(() => {
            self.focused = false;
            self.prevButton.style.display = "none";
            self.nextButton.style.display = "none";
        });
        addEventListener("resize", function() {
            if (Lightbox.isSmallScreen()) {
                self.prevButton.style.display = "none";
                self.nextButton.style.display = "none";
            } else {
                self.prevButton.style.display = "block";
                self.nextButton.style.display = "block";
            }
        })
        addEventListener(STYLE_LOAD_EVENT_NAME, () => {
            self.refreshGrid()
        });

        let init = {x: 0, y: 0};
        let delta = {x: 0, y: 0};
        let threshold = 100;

        const animateX = (el, x, time) => {
            const anim = el.animate(
                {
                    transform: `translateX(${x}px)`,
                },
                { duration: time, fill: "forwards", easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" }
            )
            return anim;
        }

        addEventListener("touchstart", function(e) {
            init.x = e.touches[0].pageX;
            init.y = e.touches[0].pageY;
        });
        addEventListener("touchmove", function(e) {
            if (!self.focused) return;
            delta.x = e.touches[0].pageX - init.x;
            delta.y = e.touches[0].pageY - init.y;

            animateX(Lightbox.imgWrapperEl, delta.x, 0)
            if (delta.x + Math.abs(delta.y) > threshold && !self.isFirstLightbox()) {
                self.prevButton.style.display = "block";
            } else {
                self.prevButton.style.display = "none";
            }
            if (delta.x + (-Math.abs(delta.y)) < (-threshold) && !self.isLastLightbox()) {
                self.nextButton.style.display = "block";
            } else {
                self.nextButton.style.display = "none";
            }
        });
        addEventListener("touchend", function() {
            if (!Lightbox.opened) return;
            if (!self.focused) return;
            
            if (delta.x + Math.abs(delta.y) > threshold) {
                if (!self.isFirstLightbox()) {
                    let moveOutAnim = animateX(Lightbox.imgWrapperEl, this.window.innerWidth, self.SWIPE_SPEED);
                    moveOutAnim.onfinish = () => {
                        self.prevLightbox();
                        animateX(Lightbox.imgWrapperEl, -this.window.innerWidth, 0);
                        animateX(Lightbox.imgWrapperEl, 0, self.SWIPE_SPEED);
                    }
                } else {
                    animateX(Lightbox.imgWrapperEl, 20, self.SWIPE_BUMP_SPEED / 2).onfinish = () => {
                        animateX(Lightbox.imgWrapperEl, 0, self.SWIPE_BUMP_SPEED / 2);
                    }
                }
            } else if (delta.x + (-Math.abs(delta.y)) < (-threshold)) {
                if (!self.isLastLightbox()) {
                    let moveOutAnim = animateX(Lightbox.imgWrapperEl, -this.window.innerWidth, self.SWIPE_SPEED);
                    moveOutAnim.onfinish = () => {
                        self.nextLightbox();
                        animateX(Lightbox.imgWrapperEl, this.window.innerWidth, 0);
                        animateX(Lightbox.imgWrapperEl, 0, self.SWIPE_SPEED);
                    }
                } else {
                    animateX(Lightbox.imgWrapperEl, -20, self.SWIPE_BUMP_SPEED / 2).onfinish = () => {
                        animateX(Lightbox.imgWrapperEl, 0, self.SWIPE_BUMP_SPEED / 2);
                    }
                }
            } else {
                animateX(Lightbox.imgWrapperEl, 0, self.SWIPE_BUMP_SPEED / 2);
            }
            init = {x: 0, y: 0};
            delta = {x: 0, y: 0};
        });
    }

    setupShortcuts() {
        if (disableShortcuts) return;
        var self = this;
        document.addEventListener("keydown", function(e) {
            if (self.curr != -1 && self.focused && Lightbox.opened) {
                if (e.key == Keybinds.NAV_LEFT) {
                    self.prevLightbox();
                    self.nextButton.classList.remove("lb-pressed");
                    self.prevButton.classList.add("lb-pressed");
                }
                else if (e.key == Keybinds.NAV_RIGHT) {
                    self.nextLightbox()
                    self.prevButton.classList.remove("lb-pressed");
                    self.nextButton.classList.add("lb-pressed");
                }
            }

            if (e.key == Keybinds.RANDOM && (self.allowOpenFromRandom || self.focused)) {
                self.randomLightbox();
            }
        });
    }

    static getCellImage(source) {
        if (source.thumb) return source.thumb;
        return source.img;
    }

    initializeFixedGrid(parent, {width, height, smallFillWidth, loading}) {
        var self = this;
        this.gridEl = document.createElement("div");
        parent.appendChild(this.gridEl);

        this.generateFixedGrid(width, height, {smallFillWidth, loading});
        this.refreshGrid = () => { 
            self.generateFixedGrid(width, height, {smallFillWidth, loading}); 
        }
    }

    generateFixedGrid(width, height, {smallFillWidth, loading}) {
        var self = this;

        this.gridEl.style.minHeight = `${this.gridEl.offsetHeight}px`;
        this.gridEl.innerHTML = '';
        this.gridEl.classList.add("g-grid");
        this.gridEl.classList.add("g-fixedGrid");

        let cellRect;

        for (let i = 0; i < this.sources.length; i++) {
            let source = this.sources[i];

            let cell = document.createElement("div");
            cell.className = "g-gridCell";
            if (smallFillWidth) cell.classList.add("g-smallFillWidth");
            cell.style.width = `${width}px`;
            cell.style.aspectRatio = `${width}/${height}`;

            const cellElements = {};
            for (const [key, gen] of Object.entries(Gallery.fixedCellElementGen)) {
                const cellElement = gen({self: self, source: source, index: i});
                cellElements[key] = cellElement
                if (cellElement && key !== "btn" && key !== "img") {
                    cell.appendChild(cellElement);
                }
                if (cellElement && key == "img" && loading) {
                    cellElement.loading = loading
                }
            }

            cell.append(cellElements["btn"], cellElements["img"]);
            if (source.noframe) cell.classList.add("g-noframe");
            cellElements["img"].onload = () => {
                cellElements["loading"].style.display = "none";
            }

            this.gridEl.appendChild(cell);
            if (!cellRect) cellRect = cell.getBoundingClientRect();
        }

        this.gridEl.style.minHeight = "";
    }

    initializeJustifiedGrid(parent, {maxRowHeight, smallMaxRowHeight, smallFillWidth, loading}) {
        var self = this;
        this.gridEl = document.createElement("div");
        parent.appendChild(this.gridEl);
        this.maxRowHeight = maxRowHeight;
        this.smallMaxRowHeight = smallMaxRowHeight;

        self.generateJustifiedGrid(this.maxRowHeight, {smallFillWidth, loading});

        addEventListener("resize", function () {
            self.refreshGrid();
        });
        self.refreshGrid = () => {
            self.generateJustifiedGrid(this.maxRowHeight, {smallFillWidth, loading});
        }
    }

    generateJustifiedGrid(maxRowHeight, {smallFillWidth, loading}) {
        var self = this;
        var gridWidth = self.gridEl.clientWidth;

        if (Lightbox.isSmallScreen()) {
            maxRowHeight = self.smallMaxRowHeight ?? smallScreenWidth;
        }

        function addItem(source, index, row) {
            let cell = document.createElement("div");
            cell.className = "g-gridCell";

            let extraWidth = 0;
            let extraHeight = 0;

            const cellElements = {};
            for (const [key, gen] of Object.entries(Gallery.justifiedCellElementGen)) {
                const cellElement = gen({self: self, source: source, index: index});
                cellElements[key] = cellElement;

                if (key === "img") {
                    const imgOuterSizes = Gallery.getOuterSize(cellElement);
                    extraWidth += imgOuterSizes.outerWidth;
                    extraHeight += imgOuterSizes.outerHeight;
                    if (loading) {
                        cellElement.loading = loading;
                    }
                }

                if (cellElement) cell.appendChild(cellElement);
            }

            const cellOuterSizes = Gallery.getOuterSize(cell);
            extraWidth += cellOuterSizes.outerWidth;
            extraHeight += cellOuterSizes.outerHeight;

            if (source.noframe) cell.classList.add("g-noframe");
            cell.style.aspectRatio = `${source.imgWidth}/${source.imgHeight}`;
            row.appendChild(cell);

            const normalizedHeight = 100;
            const normalizedWidth = (100/(source.imgHeight)) * source.imgWidth;

            return {extraWidth, extraHeight, normalizedHeight, normalizedWidth};
        }
  
        function addRow(rowHeight) {
            const newRow = currRow;

            newRow.style.width = `${gridWidth}px`
            newRow.style.height = `${Math.min(rowHeight, maxRowHeight)}px`;
            newRow.className = "g-justifiedGridRow";
            newRow.style.maxHeight = `${maxRowHeight}px`;
            newRow.style.maxWidth = `${Math.min(gridWidth, gridWidth * (maxRowHeight / rowHeight))}px`;
            if (smallFillWidth) newRow.classList.add("g-smallFillWidth");

            if (newRow.childElementCount > 0) {
                self.gridEl.appendChild(newRow);
                rows.push(newRow);
            }

            currRow = document.createElement("div");
            return newRow;
        }
  
        self.gridEl.style.minHeight = `${self.gridEl.offsetHeight}px`;
        self.gridEl.textContent = "";

        self.gridEl.classList.add("g-grid");
        self.gridEl.classList.add("g-justifiedGrid");
        var currRow = document.createElement("div");
        var imageData = [];
        var rowHeight = 0;

        var rows = [];

        let currGridHeight = 0;

        for (let i = 0; i < self.sources.length; i++) {
            let source = self.sources[i];
            if (source.imgWidth && source.imgHeight) {
                const itemResult = addItem(source, i, currRow);
                imageData.push({src: source, ...itemResult});

                const desiredWidth = gridWidth - imageData.reduce((sum, data) => sum + data.extraWidth, 0);
                rowHeight = desiredWidth/imageData.reduce((sum, data) => sum + data.normalizedWidth, 0) * itemResult.normalizedHeight;
                rowHeight += itemResult.extraHeight;

                if (rowHeight <= maxRowHeight) {
                    const rowResult = addRow(rowHeight);

                    Array.from(rowResult.children).forEach((child) => {
                        child.style.height = `calc(100% - ${itemResult.extraHeight}px)`
                    });

                    currGridHeight += rowResult.itemHeight;
                    rowHeight = 0;
                    imageData = [];
                }
            } else {
                console.error(`Missing width and height data for ${source.img}`);
            }
        }
        if (self.sources.length > 0) {
            const rowResult = addRow(rowHeight);

            Array.from(rowResult.children).forEach((child) => {
                child.style.height = `calc(100% - ${imageData[0].extraHeight}px)`
            });
        }

        self.gridEl.style.minHeight = ``;
    }

    static getOuterSize(element) {
        let outerWidth = 0;
        let outerHeight = 0;

        document.getElementsByTagName("body")[0].appendChild(element);

        outerWidth += element.offsetWidth - element.clientWidth;
        outerHeight += element.offsetHeight - element.clientHeight;

        const computedStyle = window.getComputedStyle(element);
        outerWidth += parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight);
        outerHeight += parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);

        outerWidth += parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        outerHeight += parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);

        return {outerWidth, outerHeight}
    }

    static sortSources(sources) {
        sources.forEach((source, i) => {
            if (source.order === undefined) source.order = i;
        })

        sources = sources.sort((a, b) => {
            return (a.order > b.order) || -(a.order < b.order);
        });

        return sources;
    }

    getSourceSize() {
        return this.sources.length;
    }

    updateSources(sources = this.sources, force = false) {
        let sortedSources = Gallery.sortSources(sources);

        if (sortedSources.length === this.sources.length && !force) {
            let sameSources = true;
            for (let i = 0; i < sortedSources.length; i++) {
                if (sortedSources[i] !== this.sources[i]) {
                    sameSources = false;
                }
            }
            if (sameSources) return;
        }

        this.sources = Gallery.sortSources(sources);

        Gallery.onSourcesChanged(this, sources);
    }
}

class GalleryGrid extends HTMLElement {
    static observedAttributes = [
        "id", 
        "gridtype", 
        "maxperpage", 
        "cellwidth", 
        "cellheight", 
        "maxrowheight", 
        "captions", 
        "hide", 
        "ascending",
        "small-fillwidth",
        "small-maxrowheight", 
        "small-lbdisabled",
        "filters", 
        "sort",
        "pagenav-display"
    ];

    static ids = [];
    static idCounter = 0;

    constructor() {
        super();
        this.gridInitialized = false;
        
        this.gridType;
        this.gallery;
        this.sources = [];

        this.page = 1;
        this.pageCount;
        this.maxPerPage;
        this.pageNavs = [];
        this.pageNavDisplay;

        this.filters;
        this.includeFilters = [];
        this.sort;
        this.sorting;
        this.ascending = false;
    }

    connectedCallback() {
        if (!this.id) {
            this.id = GalleryGrid.idCounter.toString();
            while (GalleryGrid.ids.includes(this.id)) {
                GalleryGrid.idCounter++;
                this.id = GalleryGrid.idCounter.toString();
            }
            GalleryGrid.idCounter++;
        } else if (this.id && GalleryGrid.ids.includes(this.id)) {
            while (GalleryGrid.ids.includes(this.id)) {
                GalleryGrid.idCounter++;
                this.id += '_' + GalleryGrid.idCounter.toString();
            }
        }
        GalleryGrid.ids.push(this.id);

        if (!this.getAttribute("gridtype")) {
            this.gridType = Defaults.GRID_TYPE;
            if (this.getAttribute("cellwidth" || this.getAttribute("cellheight"))) this.gridType = "fixed";
            if (this.getAttribute("maxrowheight")) this.gridType = "justified";
        } else {
            this.gridType = this.validateSelection("gridtype", VALID_GRIDTYPES, Defaults.GRID_TYPE);
        }

        this.addAll(this.children)
    }

    validateNumber(valueName, defaultValue) {
        const numStr = this.getAttribute(valueName);
        if (!numStr) return defaultValue;
        const num = parseInt(numStr);
        if (!num) {
            console.warn("Invalid value for "+valueName);
            return defaultValue;
        }
        if (num < 0) {
            console.warn("Cannot use negative number for "+valueName);
            return defaultValue;
        }
        return num;
    }

    validateSelection(valueName, acceptedValues, defaultValue) {
        const value = this.getAttribute(valueName);
        if (!value) return defaultValue;

        if (!acceptedValues.includes(value)) {
            console.warn(`Invalid ${valueName} - Accepted values: ${acceptedValues.join(", ")}`);
            return defaultValue;
        }

        return value;
    }

    validateBoolean(valueName) {
        const value = this.getAttribute(valueName)
        return value === null ? false : value !== "false";
    }

    initializeGrid() {
        this.innerHTML = "";

        this.maxPerPage = this.validateNumber("maxperpage", Defaults.MAX_PER_PAGE);
        var width = this.validateNumber("cellwidth", Defaults.CELL_WIDTH);
        var height = this.validateNumber("cellheight", Defaults.CELL_HEIGHT);
        var maxRowHeight = this.validateNumber("maxrowheight", Defaults.MAX_ROW_HEIGHT);

        var smallFillWidth = this.validateBoolean("small-fillwidth");
        var smallMaxRowHeight = this.validateNumber("small-maxrowheight", maxRowHeight);
        var smallLbDisabled = this.validateBoolean("small-lbdisabled");

        this.filters = this.validateSelection("filters", VALID_FILTERS, Defaults.FILTERS);
        this.sort = this.validateSelection("sort", VALID_SORTS, Defaults.SORT)
        if (this.getAttribute("ascending") === null && this.sort == "alphabetical") {
            this.ascending = true;
        } else this.ascending = this.validateBoolean("ascending");

        this.pageNavDisplay = this.validateSelection("pagenav-display", VALID_PAGENAV_DISPLAY, Defaults.PAGENAV_DISPLAY)

        var captions = this.validateSelection("captions", VALID_CAPTIONS, Defaults.CAPTIONS);
        var hiddenElements = this.getAttribute("hide")?.split(",");
        var loading = this.getAttribute("loading");

        const sifterDiv = document.createElement("div");
        sifterDiv.className = "g-sifterWrapper";
        if (this.filters === "none" && this.sort === "none") sifterDiv.style.display = "none";
        
        if (this.filters !== "none") {
            const filterList = [];

            if (this.filters === "tags") {
                let hasUntaggedSources = false;
                this.sources.forEach((source) => {
                    if (source.tags) {
                        source.tags.forEach((tag) => {
                            if (!filterList.includes(tag)) filterList.push(tag);
                        });
                    } else hasUntaggedSources = true;
                });
                filterList.sort((a, b) => a > b || -(a < b));
                if (hasUntaggedSources) filterList.push(undefined);
            }

            const filterWrapper = document.createElement("div");
            filterWrapper.className = 'g-filters g-sifter';
            filterWrapper.innerHTML = `<span class='g-sifterName'>Filters</span>`;
            const inputs = document.createElement("div");
            inputs.className = "g-inputs";
            filterWrapper.appendChild(inputs);

            filterList.forEach((filter) => {
                const filterInput = document.createElement("input");
                filterInput.className = 'g-filterInput';
                filterInput.name = `${this.id}_filter`;
                filterInput.type = 'checkbox';
                filterInput.checked = true;

                const filterName = document.createElement('span');
                filterName.className = filter ? '' : 'g-filterInputOther';
                filterName.textContent = filter ?? '';

                const inputWrapper = document.createElement("div");
                inputWrapper.className = 'g-inputWrapper';

                inputWrapper.appendChild(filterInput);
                inputWrapper.appendChild(filterName);
                inputs.appendChild(inputWrapper);

                this.includeFilters.push(filter);

                filterInput.onchange = () => {
                    if (!filterInput.checked) {
                        this.includeFilters = this.includeFilters.filter((f) => f !== filter);
                    } else this.includeFilters.push(filter);
                    this.applySourceChanges()
                }
            });

            sifterDiv.appendChild(filterWrapper);
        }

        if (this.sort !== "none") {
            this.sorting = this.ascending ? "ascending" : "descending";

            const sortWrapper = document.createElement("div");
            sortWrapper.className = 'g-sort g-sifter';
            if (this.sort === "alphabetical") sortWrapper.classList.add('g-sortAlphabetical');
            sortWrapper.innerHTML = `<span class='g-sifterName'>Sort</span>`;
            const inputs = document.createElement("div");
            inputs.className = "g-inputs";
            sortWrapper.appendChild(inputs);

            const sortOptions = ["ascending", "descending"]

            sortOptions.forEach((sortOption, i) => {
                let isAscending = i == 0;
                const sortInput = document.createElement("input");
                sortInput.className = `g-sortInput`;
                sortInput.name = `${this.id}_sort`;
                sortInput.type = 'radio';
                sortInput.checked = this.ascending ? i == 0 : i == 1;

                const sortName = document.createElement('span');
                sortName.className = `g-sortInput${sortOption.charAt(0).toUpperCase() + sortOption.substring(1)}`;

                sortInput.onchange = () => {
                    if (sortInput.checked) {
                        if (isAscending) this.sorting = "ascending";
                        else this.sorting = "descending";
                        this.applySourceChanges();
                    }
                }

                const inputWrapper = document.createElement("div");
                inputWrapper.className = 'g-inputWrapper';
                inputWrapper.appendChild(sortInput);
                inputWrapper.appendChild(sortName);
                inputs.appendChild(inputWrapper);
            });

            sifterDiv.appendChild(sortWrapper);
        }

        this.appendChild(sifterDiv);

        this.gallery = new Gallery(this.sources, {smallLightboxEnabled: !smallLbDisabled, captions, hiddenElements});

        if (this.gridType == "fixed") {
            this.gallery.initializeFixedGrid(this, {
                width: width, 
                height: height,
                smallFillWidth,
                loading
            })
        } else if (this.gridType == "justified") {
            this.gallery.initializeJustifiedGrid(this, {smallMaxRowHeight, maxRowHeight, smallFillWidth, loading})
        }

        if (this.maxPerPage) {
            this.pageCount = Math.max(Math.floor(this.sources.length / this.maxPerPage) + ((this.sources.length % this.maxPerPage) !== 0 ? 1 : 0), 1)

            const createPageNav = () => {
                const pageNav = document.createElement("div");
                pageNav.className = "g-pageNav";

                const pageNavPrevButton = document.createElement("button");
                pageNavPrevButton.className = "g-pageNavPrev g-pageNavButton";
                pageNav.appendChild(pageNavPrevButton);
                pageNavPrevButton.onclick = () => {
                    this.page = Math.max(1, this.page - 1);
                    this.applySourceChanges();
                }

                const pageNavNum = document.createElement("span");
                pageNavNum.className = 'g-pageNavNum';
                pageNav.appendChild(pageNavNum);

                const pageNavNextButton = document.createElement("button");
                pageNavNextButton.className = "g-pageNavNext g-pageNavButton";
                pageNav.appendChild(pageNavNextButton);
                pageNavNextButton.onclick = () => {
                    this.page = Math.min(this.pageCount, this.page + 1);
                    this.applySourceChanges();
                }

                return {
                    nav: pageNav,
                    navPrevButton: pageNavPrevButton,
                    navNum: pageNavNum,
                    navNextButton: pageNavNextButton,
                };
            }
            
            const pageNav = createPageNav();
            this.appendChild(pageNav.nav);
            this.pageNavs = [pageNav];

            if (this.pageNavDisplay === "bottom") pageNav.nav.style.order = "300";
            if (this.pageNavDisplay === "top") pageNav.nav.style.order = "150";
            if (this.pageNavDisplay === "both") {
                pageNav.nav.style.order = "150";

                const otherPageNav = createPageNav();
                otherPageNav.nav.style.order = "300";
                this.appendChild(otherPageNav.nav);
                this.pageNavs.push(otherPageNav);
            }
        }

        this.gridInitialized = true;
        this.refreshGalleryGrid();
    }

    refreshGalleryGrid() {
        if (!this.gridInitialized) return;
        this.gallery.refreshGrid();
        this.applySourceChanges();
    }

    applySourceChanges() {
        if (!this.gridInitialized) return;
        let changedSources = [...this.sources];

        if (this.filters !== "none" && this.includeFilters) {
            changedSources = this.sources.filter((source) => {
                let include = false;
                source.tags?.forEach((tag) => {
                    if (this.includeFilters.includes(tag)) include = true;
                });
                if (!source.tags && this.includeFilters.includes(undefined)) {
                    include = true;
                }
                return include;
            })
        }

        if (this.sort == "none" && this.ascending ) {
            changedSources = changedSources.toReversed();
            changedSources.forEach((source, i) => {
                source.order = i;
            });
        }
        if (this.sort && this.sort == "default") {
            if (this.sorting === "ascending") {
                changedSources = changedSources.toReversed();
                changedSources.forEach((source, i) => {
                    source.order = i;
                });
            }
        } else if (this.sort && this.sort == "alphabetical") {
            if (this.sorting === "ascending") {
                changedSources = changedSources.sort((a, b) => {
                    if (!b.title) return true;
                    return a.title > b.title || -(a.title < b.title)
                });
            } else {
                changedSources = changedSources.sort((a, b) => {
                    if (!a.title) return true;
                    return a.title < b.title || -(a.title >= b.title)
                })
            }
            changedSources.forEach((source, i) => {
                source.order = i;
            });
        } else {
            changedSources.forEach((source, i) => {
                if (source.order === undefined) source.order = i;
            })

            changedSources = changedSources.sort((a, b) => {
                return (a.order > b.order) || -(a.order < b.order);
            });
        }

        if (this.maxPerPage) {
            this.pageCount = Math.max(Math.floor(changedSources.length / this.maxPerPage) + ((changedSources.length % this.maxPerPage) !== 0 ? 1 : 0), 1)
            this.page = Math.min(this.page, this.pageCount);

            this.pageNavs.forEach((pageNav) => {
                pageNav.navNum.textContent = `${this.page}/${this.pageCount}`;
                pageNav.navPrevButton.disabled = this.page === 1;
                pageNav.navNextButton.disabled = this.page === this.pageCount;
            })

            this.gallery.updateSources(changedSources.slice(((this.page - 1) * this.maxPerPage), (this.page * this.maxPerPage)));
        } else {
            this.gallery.updateSources(changedSources);
        }
    }

    addAll(imgEls) {
        var promises = [];
        let order = 0;

        Array.from(imgEls).forEach((child) => {
            if (child.tagName.toLowerCase() !== "img") console.warn("Non-image element in gallery grid ");
            const res = this.add(child, order, false);
            if (res) promises.push(res);
            order++;
        });

        if (this.gridType === "fixed") {
            if (this.gridInitialized) this.refreshGalleryGrid();
            else this.initializeGrid();
        } else if (this.gridType === "justified") {
            if (!this.gridInitialized) this.initializeGrid();

            if (promises.length > 0) {
                let loadingText;
                if (!this.querySelector(".g-loading")) {
                    loadingText = document.createElement('p');
                    loadingText.className = 'g-loading';
                    loadingText.textContent = 'Loading';
                    loadingText.style.opacity = '0';
                    this.appendChild(loadingText);

                    loadingText.animate({ opacity: `1`},
                        { duration: 500, fill: "forwards", easing: "steps(1)" }
                    );
                }
                this.gallery.gridEl.style.opacity = "0";

                promises.forEach((promise) => {
                    promise.then(() => {
                        loadingText.remove();
                        this.gallery.gridEl.style.opacity = "1";
                        this.refreshGalleryGrid();
                    })
                })
            }
        }
    }

    add(imgEl, order = 0, refresh = true) {
        if (!imgEl.getAttribute("src")) {
            console.error("Image is missing src URL.")
            return;
        }
        imgEl.style.display = "none";

        const cellOrder = imgEl.getAttribute("order") ?? order;
        const doRefresh = this.gridInitialized && refresh;

        if (this.gridType === "fixed") {
            this.sources.push(GallerySource.fromElement(imgEl, {order: cellOrder}));
            if (doRefresh) {
                this.refreshGalleryGrid();
            }
        } else {
            if (imgEl.width && imgEl.height) {
                this.sources.push(GallerySource.fromElement(imgEl, {width: imgEl.width, height: imgEl.height, order: cellOrder}));
                if (doRefresh) {
                    this.refreshGalleryGrid();
                }
            } else {
                const cellImage = new Image();
                cellImage.src = imgEl.getAttribute("thumb") ?? imgEl.getAttribute("src");
                const loadPromise = new Promise((resolve) => {
                    cellImage.onload = () => {
                        resolve(true);
                    }
                    cellImage.onerror = () => {
                        if (imgEl.getAttribute("thumb")) {
                            console.error("Thumbnail url is invalid.")
                        } else console.error("Image url is invalid.")
                        resolve(false);
                    }
                })
                loadPromise.then((success) => {
                    if (success) {
                        this.sources.push(GallerySource.fromElement(imgEl, {width: cellImage.naturalWidth, height: cellImage.naturalHeight, order: cellOrder}));
                        if (doRefresh) {
                            this.refreshGalleryGrid();
                        }
                    }
                });
                return loadPromise;
            }
        }
    }

    clear() {
        if (!this.gridInitialized) {
            console.warn("Cannot clear grid before initialization");
            return;
        }
        this.sources = [];
        this.refreshGalleryGrid();
    }
}
customElements.define('gallery-grid', GalleryGrid);

function main() {
    if (!document.querySelector(`link[href='${stylePath}']`)) {
        Object.values(document.querySelectorAll('gallery-grid')).forEach((value) => {
            value.style.display = "none";
        })

        const cssLink = document.createElement('link');
        cssLink.type = 'text/css';
        cssLink.rel = 'stylesheet';
        cssLink.href = stylePath;
        document.getElementsByTagName('head')[0].appendChild(cssLink);

        cssLink.onload = () => {
            Object.values(document.querySelectorAll('gallery-grid')).forEach((value) => {
                value.style.display = "";
            })
            dispatchEvent(styleLoadEvent);
        }
    }

    const lbCore = document.createElement("div");
    lbCore.id = "lb";
    lbCore.style.display = "none";
    lbCore.innerHTML = `
        <div id="lb_wrapper">     
            <button class="lb-nav" id="lb_prev"></button>
            <div id="lb_container">
                <button id="lb_exitButton"></button>
                <button id="lb_smallExitButton"></button>
                <div id="lb_imageWrapper">
                    <img id="lb_image" />  
                    <div id="lb_loading"></div>
                </div>     
                <div id="lb_info">
                    <div id="lb_tags"></div>
                    <p id="lb_title"></p>
                    <p id="lb_desc"></p>
                </div>
            </div>
            <button class="lb-nav" id="lb_next"></button>
        </div>`
    document.getElementsByTagName('body')[0].appendChild(lbCore);

    document.addEventListener("astro:before-swap", (event) => {
        const newDoc = event.newDocument;
        if (!newDoc.head.querySelector(`link[href='${stylePath}']`)) {
            const cssLink = newDoc.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = stylePath;
            newDoc.head.appendChild(cssLink);
        }
        newDoc.body.appendChild(lbCore);
    });
}