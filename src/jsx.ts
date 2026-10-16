/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/ban-types */
// This code is based on react definition in DefinitelyTyped published under the MIT license.
//      Repository: https://github.com/DefinitelyTyped/DefinitelyTyped
//      Path in the repository: types/react/v15/index.d.ts
//
// Copyrights of original definition are:
//      Asana <https://asana.com>
//      AssureSign <http://www.assuresign.com>
//      Microsoft <https://microsoft.com>
//      John Reilly <https://github.com/johnnyreilly/>
//      Benoit Benezech <https://github.com/bbenezech>
//      Patricio Zavolinsky <https://github.com/pzavolinsky>
//      Digiguru <https://github.com/digiguru>
//      Eric Anderson <https://github.com/ericanderson>
//      Albert Kurniawan <https://github.com/morcerf>
//      Tanguy Krotoff <https://github.com/tkrotoff>
//      Dovydas Navickas <https://github.com/DovydasNavickas>
//      Stéphane Goetz <https://github.com/onigoetz>

interface EventHandler<E extends Event> {
    (event: E): void
}

export interface AdditionalElementAttributes {
    mounted?: (n: Node) => void
    update?: (n: Node, uc: any) => void
    const?: boolean
    model?: any
}

/**
 * Used to represent DOM API's where users can either pass
 * true or false as a boolean or as its equivalent strings.
 */
type Booleanish = boolean | "true" | "false";

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin MDN}
 */
type CrossOrigin = "anonymous" | "use-credentials" | "" | undefined;

// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    "aria-activedescendant"?: string | undefined;
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    "aria-atomic"?: Booleanish | undefined;
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    "aria-autocomplete"?: "none" | "inline" | "list" | "both" | undefined;
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    /**
     * Defines a string value that labels the current element, which is intended to be converted into Braille.
     * @see aria-label.
     */
    "aria-braillelabel"?: string | undefined;
    /**
     * Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille.
     * @see aria-roledescription.
     */
    "aria-brailleroledescription"?: string | undefined;
    "aria-busy"?: Booleanish | undefined;
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    "aria-checked"?: boolean | "false" | "mixed" | "true" | undefined;
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    "aria-colcount"?: number | undefined;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    "aria-colindex"?: number | undefined;
    /**
     * Defines a human readable text alternative of aria-colindex.
     * @see aria-rowindextext.
     */
    "aria-colindextext"?: string | undefined;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    "aria-colspan"?: number | undefined;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    "aria-controls"?: string | undefined;
    /** Indicates the element that represents the current item within a container or set of related elements. */
    "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined;
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    "aria-describedby"?: string | undefined;
    /**
     * Defines a string value that describes or annotates the current element.
     * @see related aria-describedby.
     */
    "aria-description"?: string | undefined;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    "aria-details"?: string | undefined;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    "aria-disabled"?: Booleanish | undefined;
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup" | undefined;
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    "aria-errormessage"?: string | undefined;
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    "aria-expanded"?: Booleanish | undefined;
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    "aria-flowto"?: string | undefined;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    "aria-grabbed"?: Booleanish | undefined;
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined;
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    "aria-hidden"?: Booleanish | undefined;
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling" | undefined;
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    "aria-keyshortcuts"?: string | undefined;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    "aria-label"?: string | undefined;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    "aria-labelledby"?: string | undefined;
    /** Defines the hierarchical level of an element within a structure. */
    "aria-level"?: number | undefined;
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    "aria-live"?: "off" | "assertive" | "polite" | undefined;
    /** Indicates whether an element is modal when displayed. */
    "aria-modal"?: Booleanish | undefined;
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    "aria-multiline"?: Booleanish | undefined;
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    "aria-multiselectable"?: Booleanish | undefined;
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    "aria-orientation"?: "horizontal" | "vertical" | undefined;
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    "aria-owns"?: string | undefined;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    "aria-placeholder"?: string | undefined;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    "aria-posinset"?: number | undefined;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    "aria-pressed"?: boolean | "false" | "mixed" | "true" | undefined;
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    "aria-readonly"?: Booleanish | undefined;
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    "aria-relevant"?:
    | "additions"
    | "additions removals"
    | "additions text"
    | "all"
    | "removals"
    | "removals additions"
    | "removals text"
    | "text"
    | "text additions"
    | "text removals"
    | undefined;
    /** Indicates that user input is required on the element before a form may be submitted. */
    "aria-required"?: Booleanish | undefined;
    /** Defines a human-readable, author-localized description for the role of an element. */
    "aria-roledescription"?: string | undefined;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    "aria-rowcount"?: number | undefined;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    "aria-rowindex"?: number | undefined;
    /**
     * Defines a human readable text alternative of aria-rowindex.
     * @see aria-colindextext.
     */
    "aria-rowindextext"?: string | undefined;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    "aria-rowspan"?: number | undefined;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    "aria-selected"?: Booleanish | undefined;
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    "aria-setsize"?: number | undefined;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    "aria-sort"?: "none" | "ascending" | "descending" | "other" | undefined;
    /** Defines the maximum allowed value for a range widget. */
    "aria-valuemax"?: number | undefined;
    /** Defines the minimum allowed value for a range widget. */
    "aria-valuemin"?: number | undefined;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    "aria-valuenow"?: number | undefined;
    /** Defines the human readable text alternative of aria-valuenow for a range widget. */
    "aria-valuetext"?: string | undefined;
}

// All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
type AriaRole =
    | "alert"
    | "alertdialog"
    | "application"
    | "article"
    | "banner"
    | "button"
    | "cell"
    | "checkbox"
    | "columnheader"
    | "combobox"
    | "complementary"
    | "contentinfo"
    | "definition"
    | "dialog"
    | "directory"
    | "document"
    | "feed"
    | "figure"
    | "form"
    | "grid"
    | "gridcell"
    | "group"
    | "heading"
    | "img"
    | "link"
    | "list"
    | "listbox"
    | "listitem"
    | "log"
    | "main"
    | "marquee"
    | "math"
    | "menu"
    | "menubar"
    | "menuitem"
    | "menuitemcheckbox"
    | "menuitemradio"
    | "navigation"
    | "none"
    | "note"
    | "option"
    | "presentation"
    | "progressbar"
    | "radio"
    | "radiogroup"
    | "region"
    | "row"
    | "rowgroup"
    | "rowheader"
    | "scrollbar"
    | "search"
    | "searchbox"
    | "separator"
    | "slider"
    | "spinbutton"
    | "status"
    | "switch"
    | "tab"
    | "table"
    | "tablist"
    | "tabpanel"
    | "term"
    | "textbox"
    | "timer"
    | "toolbar"
    | "tooltip"
    | "tree"
    | "treegrid"
    | "treeitem"
    | (string & {});

// this list is "complete" in that it contains every SVG attribute
// that React supports, but the types can be improved.
// Full list here: https://facebook.github.io/react/docs/dom-elements.html
//
// The three broad type categories are (in order of restrictiveness):
//   - "number | string"
//   - "string"
//   - union of string literals
interface SVGAttributes<T> extends AriaAttributes, HTMLAttributes {
    // React-specific Attributes
    suppressHydrationWarning?: boolean | undefined;

    // Attributes which also defined in HTMLAttributes
    // See comment in SVGDOMPropertyConfig.js
    className?: string | undefined;
    color?: string | undefined;
    height?: number | string | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    max?: number | string | undefined;
    media?: string | undefined;
    method?: string | undefined;
    min?: number | string | undefined;
    name?: string | undefined;
    nonce?: string | undefined;
    part?: string | undefined;
    slot?: string | undefined;
    style?: any | undefined; // react @types has CSSProperties here 
    target?: string | undefined;
    type?: string | undefined;
    width?: number | string | undefined;

    // Other HTML properties supported by SVG elements in browsers
    role?: AriaRole | undefined;
    tabIndex?: number | undefined;
    crossOrigin?: CrossOrigin;

    // SVG Specific attributes
    accentHeight?: number | string | undefined;
    accumulate?: "none" | "sum" | undefined;
    additive?: "replace" | "sum" | undefined;
    alignmentBaseline?:
    | "auto"
    | "baseline"
    | "before-edge"
    | "text-before-edge"
    | "middle"
    | "central"
    | "after-edge"
    | "text-after-edge"
    | "ideographic"
    | "alphabetic"
    | "hanging"
    | "mathematical"
    | "inherit"
    | undefined;
    allowReorder?: "no" | "yes" | undefined;
    alphabetic?: number | string | undefined;
    amplitude?: number | string | undefined;
    arabicForm?: "initial" | "medial" | "terminal" | "isolated" | undefined;
    ascent?: number | string | undefined;
    attributeName?: string | undefined;
    attributeType?: string | undefined;
    autoReverse?: Booleanish | undefined;
    azimuth?: number | string | undefined;
    baseFrequency?: number | string | undefined;
    baselineShift?: number | string | undefined;
    baseProfile?: number | string | undefined;
    bbox?: number | string | undefined;
    begin?: number | string | undefined;
    bias?: number | string | undefined;
    by?: number | string | undefined;
    calcMode?: number | string | undefined;
    capHeight?: number | string | undefined;
    clip?: number | string | undefined;
    clipPath?: string | undefined;
    clipPathUnits?: number | string | undefined;
    clipRule?: number | string | undefined;
    colorInterpolation?: number | string | undefined;
    colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit" | undefined;
    colorProfile?: number | string | undefined;
    colorRendering?: number | string | undefined;
    contentScriptType?: number | string | undefined;
    contentStyleType?: number | string | undefined;
    cursor?: number | string | undefined;
    cx?: number | string | undefined;
    cy?: number | string | undefined;
    d?: string | undefined;
    decelerate?: number | string | undefined;
    descent?: number | string | undefined;
    diffuseConstant?: number | string | undefined;
    direction?: number | string | undefined;
    display?: number | string | undefined;
    divisor?: number | string | undefined;
    dominantBaseline?:
    | "auto"
    | "use-script"
    | "no-change"
    | "reset-size"
    | "ideographic"
    | "alphabetic"
    | "hanging"
    | "mathematical"
    | "central"
    | "middle"
    | "text-after-edge"
    | "text-before-edge"
    | "inherit"
    | undefined;
    dur?: number | string | undefined;
    dx?: number | string | undefined;
    dy?: number | string | undefined;
    edgeMode?: number | string | undefined;
    elevation?: number | string | undefined;
    enableBackground?: number | string | undefined;
    end?: number | string | undefined;
    exponent?: number | string | undefined;
    externalResourcesRequired?: Booleanish | undefined;
    fill?: string | undefined;
    fillOpacity?: number | string | undefined;
    fillRule?: "nonzero" | "evenodd" | "inherit" | undefined;
    filter?: string | undefined;
    filterRes?: number | string | undefined;
    filterUnits?: number | string | undefined;
    floodColor?: number | string | undefined;
    floodOpacity?: number | string | undefined;
    focusable?: Booleanish | "auto" | undefined;
    fontFamily?: string | undefined;
    fontSize?: number | string | undefined;
    fontSizeAdjust?: number | string | undefined;
    fontStretch?: number | string | undefined;
    fontStyle?: number | string | undefined;
    fontVariant?: number | string | undefined;
    fontWeight?: number | string | undefined;
    format?: number | string | undefined;
    fr?: number | string | undefined;
    from?: number | string | undefined;
    fx?: number | string | undefined;
    fy?: number | string | undefined;
    g1?: number | string | undefined;
    g2?: number | string | undefined;
    glyphName?: number | string | undefined;
    glyphOrientationHorizontal?: number | string | undefined;
    glyphOrientationVertical?: number | string | undefined;
    glyphRef?: number | string | undefined;
    gradientTransform?: string | undefined;
    gradientUnits?: string | undefined;
    hanging?: number | string | undefined;
    horizAdvX?: number | string | undefined;
    horizOriginX?: number | string | undefined;
    href?: string | undefined;
    ideographic?: number | string | undefined;
    imageRendering?: number | string | undefined;
    in2?: number | string | undefined;
    in?: string | undefined;
    intercept?: number | string | undefined;
    k1?: number | string | undefined;
    k2?: number | string | undefined;
    k3?: number | string | undefined;
    k4?: number | string | undefined;
    k?: number | string | undefined;
    kernelMatrix?: number | string | undefined;
    kernelUnitLength?: number | string | undefined;
    kerning?: number | string | undefined;
    keyPoints?: number | string | undefined;
    keySplines?: number | string | undefined;
    keyTimes?: number | string | undefined;
    lengthAdjust?: number | string | undefined;
    letterSpacing?: number | string | undefined;
    lightingColor?: number | string | undefined;
    limitingConeAngle?: number | string | undefined;
    local?: number | string | undefined;
    markerEnd?: string | undefined;
    markerHeight?: number | string | undefined;
    markerMid?: string | undefined;
    markerStart?: string | undefined;
    markerUnits?: number | string | undefined;
    markerWidth?: number | string | undefined;
    mask?: string | undefined;
    maskContentUnits?: number | string | undefined;
    maskUnits?: number | string | undefined;
    mathematical?: number | string | undefined;
    mode?: number | string | undefined;
    numOctaves?: number | string | undefined;
    offset?: number | string | undefined;
    opacity?: number | string | undefined;
    operator?: number | string | undefined;
    order?: number | string | undefined;
    orient?: number | string | undefined;
    orientation?: number | string | undefined;
    origin?: number | string | undefined;
    overflow?: number | string | undefined;
    overlinePosition?: number | string | undefined;
    overlineThickness?: number | string | undefined;
    paintOrder?: number | string | undefined;
    panose1?: number | string | undefined;
    path?: string | undefined;
    pathLength?: number | string | undefined;
    patternContentUnits?: string | undefined;
    patternTransform?: number | string | undefined;
    patternUnits?: string | undefined;
    pointerEvents?: number | string | undefined;
    points?: string | undefined;
    pointsAtX?: number | string | undefined;
    pointsAtY?: number | string | undefined;
    pointsAtZ?: number | string | undefined;
    preserveAlpha?: Booleanish | undefined;
    preserveAspectRatio?: string | undefined;
    primitiveUnits?: number | string | undefined;
    r?: number | string | undefined;
    radius?: number | string | undefined;
    refX?: number | string | undefined;
    refY?: number | string | undefined;
    renderingIntent?: number | string | undefined;
    repeatCount?: number | string | undefined;
    repeatDur?: number | string | undefined;
    requiredExtensions?: number | string | undefined;
    requiredFeatures?: number | string | undefined;
    restart?: number | string | undefined;
    result?: string | undefined;
    rotate?: number | string | undefined;
    rx?: number | string | undefined;
    ry?: number | string | undefined;
    scale?: number | string | undefined;
    seed?: number | string | undefined;
    shapeRendering?: number | string | undefined;
    slope?: number | string | undefined;
    spacing?: number | string | undefined;
    specularConstant?: number | string | undefined;
    specularExponent?: number | string | undefined;
    speed?: number | string | undefined;
    spreadMethod?: string | undefined;
    startOffset?: number | string | undefined;
    stdDeviation?: number | string | undefined;
    stemh?: number | string | undefined;
    stemv?: number | string | undefined;
    stitchTiles?: number | string | undefined;
    stopColor?: string | undefined;
    stopOpacity?: number | string | undefined;
    strikethroughPosition?: number | string | undefined;
    strikethroughThickness?: number | string | undefined;
    string?: number | string | undefined;
    stroke?: string | undefined;
    strokeDasharray?: string | number | undefined;
    strokeDashoffset?: string | number | undefined;
    strokeLinecap?: "butt" | "round" | "square" | "inherit" | undefined;
    strokeLinejoin?: "miter" | "round" | "bevel" | "inherit" | undefined;
    strokeMiterlimit?: number | string | undefined;
    strokeOpacity?: number | string | undefined;
    strokeWidth?: number | string | undefined;
    surfaceScale?: number | string | undefined;
    systemLanguage?: number | string | undefined;
    tableValues?: number | string | undefined;
    targetX?: number | string | undefined;
    targetY?: number | string | undefined;
    textAnchor?: "start" | "middle" | "end" | "inherit" | undefined;
    textDecoration?: number | string | undefined;
    textLength?: number | string | undefined;
    textRendering?: number | string | undefined;
    to?: number | string | undefined;
    transform?: string | undefined;
    u1?: number | string | undefined;
    u2?: number | string | undefined;
    underlinePosition?: number | string | undefined;
    underlineThickness?: number | string | undefined;
    unicode?: number | string | undefined;
    unicodeBidi?: number | string | undefined;
    unicodeRange?: number | string | undefined;
    unitsPerEm?: number | string | undefined;
    vAlphabetic?: number | string | undefined;
    values?: string | undefined;
    vectorEffect?: number | string | undefined;
    version?: string | undefined;
    vertAdvY?: number | string | undefined;
    vertOriginX?: number | string | undefined;
    vertOriginY?: number | string | undefined;
    vHanging?: number | string | undefined;
    vIdeographic?: number | string | undefined;
    viewBox?: string | undefined;
    viewTarget?: number | string | undefined;
    visibility?: number | string | undefined;
    vMathematical?: number | string | undefined;
    widths?: number | string | undefined;
    wordSpacing?: number | string | undefined;
    writingMode?: number | string | undefined;
    x1?: number | string | undefined;
    x2?: number | string | undefined;
    x?: number | string | undefined;
    xChannelSelector?: string | undefined;
    xHeight?: number | string | undefined;
    xlinkActuate?: string | undefined;
    xlinkArcrole?: string | undefined;
    xlinkHref?: string | undefined;
    xlinkRole?: string | undefined;
    xlinkShow?: string | undefined;
    xlinkTitle?: string | undefined;
    xlinkType?: string | undefined;
    xmlBase?: string | undefined;
    xmlLang?: string | undefined;
    xmlns?: string | undefined;
    xmlnsXlink?: string | undefined;
    xmlSpace?: string | undefined;
    y1?: number | string | undefined;
    y2?: number | string | undefined;
    y?: number | string | undefined;
    yChannelSelector?: string | undefined;
    z?: number | string | undefined;
    zoomAndPan?: string | undefined;
}


type SVGProps<T extends SVGElement> = SVGAttributes<T>

declare global {
    namespace JSX {

        //        type Element = H

        interface IntrinsicElements extends IntrinsicElementAttributes {

            "x-autosuggest": HtmlHTMLAttributes & {
                suggestions: string[]
                value: string
            }

            label: LabelHTMLAttributes & {
                for?: string
            }

            svg: SVGProps<SVGSVGElement> & { class?: string | undefined, xmlns: "http://www.w3.org/2000/svg" }
            path: SVGProps<SVGPathElement> & { class?: string | undefined }
            textPath: SVGProps<SVGTextPathElement> & { class?: string | undefined, style?: string | undefined }
            tspan: SVGProps<SVGTSpanElement> & { class?: string | undefined }
            circle: SVGProps<SVGCircleElement> & { class?: string | undefined }
            rect: SVGProps<SVGRectElement> & { class?: string | undefined }
            line: SVGProps<SVGLineElement> & { class?: string | undefined }
            text: SVGProps<SVGTextElement> & { class?: string | undefined, style?: string | undefined }
            g: SVGProps<SVGGElement> & { class?: string | undefined }
            foreignObject: SVGProps<SVGForeignObjectElement> & { class?: string | undefined }
        }
    }
}

// 1. Define the Thunk transformer for a single type
type WithThunk<T> = T extends undefined
    ? undefined
    : T | (() => T | undefined)

// 2. Map across all keys of the existing interface
export type HTMLAttributes = {
    [K in keyof HTMLAttributesBase]?: WithThunk<NonNullable<HTMLAttributesBase[K]>>
}

export interface HTMLAttributesBase extends AdditionalElementAttributes {
    class?: string
    style?: string
    accesskey?: string
    contenteditable?: boolean
    contextmenu?: string
    dir?: string
    disabled?: boolean
    draggable?: boolean
    hidden?: boolean
    id?: string
    lang?: string
    spellcheck?: boolean
    tabindex?: number
    title?: string
    role?: string

    // clipboard events
    onCopy?: ClipboardEvent
    onCut?: ClipboardEvent
    onPaste?: ClipboardEvent

    // composition events
    onCompositionend?: CompositionEvent
    onCompositionstart?: CompositionEvent
    onCompositionupdate?: CompositionEvent

    // drag drop events
    ondrag?: EventHandler<DragEvent>
    ondragend?: EventHandler<DragEvent>
    ondragenter?: EventHandler<DragEvent>
    ondragexit?: EventHandler<DragEvent>
    ondragleave?: EventHandler<DragEvent>
    ondragover?: EventHandler<DragEvent>
    ondragstart?: EventHandler<DragEvent>
    ondrop?: EventHandler<DragEvent>

    // focus events
    onfocus?: (ev: FocusEvent) => void
    onfocusout?: (ev: FocusEvent) => void
    onblur?: (ev: FocusEvent) => void

    // form events
    onchange?: EventHandler<Event>
    oninput?: EventHandler<Event>
    onreset?: EventHandler<Event>
    onsubmit?: EventHandler<Event>
    oninvalid?: EventHandler<Event>

    // image events
    onload?: EventHandler<Event>
    onerror?: EventHandler<Event>

    // keyboard events
    onkeydown?: EventHandler<KeyboardEvent>
    onkeypress?: EventHandler<KeyboardEvent>
    onkeyup?: EventHandler<KeyboardEvent>

    // mouse events
    onclick?: EventHandler<MouseEvent>
    oncontextmenu?: EventHandler<MouseEvent>
    ondblclick?: EventHandler<MouseEvent>
    onmousedown?: EventHandler<MouseEvent>
    onmouseenter?: EventHandler<MouseEvent>
    onmouseleave?: EventHandler<MouseEvent>
    onmousemove?: EventHandler<MouseEvent>
    onmouseout?: EventHandler<MouseEvent>
    onmouseover?: EventHandler<MouseEvent>
    onmouseup?: EventHandler<MouseEvent>

    // media events
    onAbort?: EventHandler<Event>
    onCanplay?: EventHandler<Event>
    onCanplaythrough?: EventHandler<Event>
    onDurationchange?: EventHandler<Event>
    onEmptied?: EventHandler<Event>
    onEncrypted?: EventHandler<Event>
    onEnded?: EventHandler<Event>
    onLoadeddata?: EventHandler<Event>
    onLoadedmetadata?: EventHandler<Event>
    onLoadstart?: EventHandler<Event>
    onPause?: EventHandler<Event>
    onPlay?: EventHandler<Event>
    onPlaying?: EventHandler<Event>
    onProgress?: EventHandler<Event>
    onRatechange?: EventHandler<Event>
    onSeeked?: EventHandler<Event>
    onSeeking?: EventHandler<Event>
    onStalled?: EventHandler<Event>
    onSuspend?: EventHandler<Event>
    onTimeupdate?: EventHandler<Event>
    onVolumechange?: EventHandler<Event>
    onWaiting?: EventHandler<Event>

    // selection events
    onSelect?: EventHandler<Event>

    // UI events
    onScroll?: UIEvent

    // touch events
    onTouchcancel?: TouchEvent
    onTouchend?: TouchEvent
    onTouchmove?: TouchEvent
    onTouchstart?: TouchEvent

    // wheel events
    onWheel?: WheelEvent

    // animation events
    onAnimationstart?: AnimationEvent
    onAnimationend?: AnimationEvent
    onAnimationiteration?: AnimationEvent

    // transition events
    onTransitionend?: TransitionEvent
    onTransitionstart?: TransitionEvent
}

export interface AnchorHTMLAttributes extends HTMLAttributes {
    download?: any
    href?: string
    hreflang?: string
    media?: string
    rel?: string
    target?: string
}

export interface AreaHTMLAttributes extends HTMLAttributes {
    alt?: string
    coord?: string
    download?: any
    href?: string
    hreflang?: string
    media?: string
    rel?: string
    shape?: string
    target?: string
}

export interface AudioHTMLAttributes extends MediaHTMLAttributes { }

export interface BaseHTMLAttributes extends HTMLAttributes {
    href?: string
    target?: string
}

export interface BlockquoteHTMLAttributes extends HTMLAttributes {
    cite?: string
}

export interface ButtonHTMLAttributes extends HTMLAttributes {
    autofocus?: boolean
    disabled?: boolean
    form?: string
    formaction?: string
    formenctype?: string
    formmethod?: string
    formnovalidate?: boolean
    formtarget?: string
    name?: string
    type?: string
    value?: string | string[] | number
}

export interface CanvasHTMLAttributes extends HTMLAttributes {
    height?: number | string
    width?: number | string
}

export interface ColHTMLAttributes extends HTMLAttributes {
    span?: number
}

export interface ColgroupHTMLAttributes extends ColHTMLAttributes { }

export interface DetailsHTMLAttributes extends HTMLAttributes {
    open?: boolean
}

export interface DelHTMLAttributes extends HTMLAttributes {
    cite?: string
    datetime?: string
}

export interface EmbedHTMLAttributes extends HTMLAttributes {
    height?: number | string
    src?: string
    type?: string
    width?: number | string
}

export interface FieldsetHTMLAttributes extends HTMLAttributes {
    disabled?: boolean
    form?: string
    name?: string
}

export interface FormHTMLAttributes extends HTMLAttributes {
    acceptcharset?: string
    action?: string
    autocomplete?: string
    enctype?: string
    method?: string
    name?: string
    novalidate?: boolean
    target?: string
}

export interface HtmlHTMLAttributes extends HTMLAttributes {
    manifest?: string
}

export interface IframeHTMLAttributes extends HTMLAttributes {
    allowfullscreen?: boolean
    allowtransparency?: boolean
    frameborder?: number | string
    height?: number | string
    marginheight?: number
    marginwidth?: number
    name?: string
    sandbox?: string
    scrolling?: string
    seamless?: boolean
    src?: string
    srcdoc?: string
    width?: number | string
}

export interface ImgHTMLAttributes extends HTMLAttributes {
    alt?: string
    height?: number | string
    sizes?: string
    src?: string
    srcset?: string
    usemap?: string
    width?: number | string
}

export interface InsHTMLAttributes extends HTMLAttributes {
    cite?: string
    datetime?: string
}

export interface InputHTMLAttributes extends HTMLAttributes {
    accept?: string
    alt?: string
    autocomplete?: string
    autofocus?: boolean
    capture?: boolean // https://www.w3.org/tr/html-media-capture/#the-capture-attribute
    checked?: boolean
    crossorigin?: string
    disabled?: boolean
    form?: string
    formaction?: string
    formenctype?: string
    formmethod?: string
    formnovalidate?: boolean
    formtarget?: string
    height?: number | string
    list?: string
    max?: number | string
    maxlength?: number
    min?: number | string
    minlength?: number
    multiple?: boolean
    name?: string
    pattern?: string
    placeholder?: string
    readonly?: boolean
    required?: boolean
    size?: number
    src?: string
    step?: number | string
    type?: string
    value?: string | string[] | number
    width?: number | string
}

export interface KeygenHTMLAttributes extends HTMLAttributes {
    autofocus?: boolean
    challenge?: string
    disabled?: boolean
    form?: string
    keytype?: string
    keyparams?: string
    name?: string
}

export interface LabelHTMLAttributes extends HTMLAttributes {
    form?: string
    for?: string
}

export interface LiHTMLAttributes extends HTMLAttributes {
    value?: string | string[] | number
}

export interface LinkHTMLAttributes extends HTMLAttributes {
    href?: string
    hreflang?: string
    integrity?: string
    media?: string
    rel?: string
    sizes?: string
    type?: string
}

export interface MapHTMLAttributes extends HTMLAttributes {
    name?: string
}

export interface MenuHTMLAttributes extends HTMLAttributes {
    type?: string
}

export interface MediaHTMLAttributes extends HTMLAttributes {
    autoplay?: boolean
    controls?: boolean
    crossorigin?: string
    loop?: boolean
    mediagroup?: string
    muted?: boolean
    preload?: string
    src?: string
}

export interface MetaHTMLAttributes extends HTMLAttributes {
    charset?: string
    content?: string
    httpequiv?: string
    name?: string
}

export interface MeterHTMLAttributes extends HTMLAttributes {
    form?: string
    high?: number
    low?: number
    max?: number | string
    min?: number | string
    optimum?: number
    value?: string | string[] | number
}

export interface QuoteHTMLAttributes extends HTMLAttributes {
    cite?: string
}

export interface ObjectHTMLAttributes extends HTMLAttributes {
    classid?: string
    data?: string
    form?: string
    height?: number | string
    name?: string
    type?: string
    usemap?: string
    width?: number | string
    wmode?: string
}

export interface OlHTMLAttributes extends HTMLAttributes {
    reversed?: boolean
    start?: number
}

export interface OptgroupHTMLAttributes extends HTMLAttributes {
    disabled?: boolean
    label?: string
}

export interface OptionHTMLAttributes extends HTMLAttributes {
    disabled?: boolean
    label?: string
    selected?: boolean
    value?: string | string[] | number
}

export interface OutputHTMLAttributes extends HTMLAttributes {
    form?: string
    htmlfor?: string
    name?: string
}

export interface ParamHTMLAttributes extends HTMLAttributes {
    name?: string
    value?: string | string[] | number
}

export interface ProgressHTMLAttributes extends HTMLAttributes {
    max?: number | string
    value?: string | string[] | number
}

export interface ScriptHTMLAttributes extends HTMLAttributes {
    async?: boolean
    charset?: string
    crossorigin?: string
    defer?: boolean
    integrity?: string
    nonce?: string
    src?: string
    type?: string
}

export interface SelectHTMLAttributes extends HTMLAttributes {
    autofocus?: boolean
    disabled?: boolean
    form?: string
    multiple?: boolean
    name?: string
    required?: boolean
    size?: number
    value?: string | string[] | number
}

export interface SourceHTMLAttributes extends HTMLAttributes {
    media?: string
    sizes?: string
    src?: string
    srcset?: string
    type?: string
}

export interface StyleHTMLAttributes extends HTMLAttributes {
    media?: string
    nonce?: string
    scoped?: boolean
    type?: string
}

export interface TableHTMLAttributes extends HTMLAttributes {
    cellpadding?: number | string
    cellspacing?: number | string
    summary?: string
}

export interface TextareaHTMLAttributes extends HTMLAttributes {
    autocomplete?: string
    autofocus?: boolean
    cols?: number
    dirname?: string
    disabled?: boolean
    form?: string
    maxlength?: number
    minlength?: number
    name?: string
    placeholder?: string
    readonly?: boolean
    required?: boolean
    rows?: number
    value?: string | string[] | number
    wrap?: string
}

export interface TdHTMLAttributes extends HTMLAttributes {
    colspan?: number
    headers?: string
    rowspan?: number
}

export interface ThHTMLAttributes extends HTMLAttributes {
    colspan?: number
    headers?: string
    rowspan?: number
    scope?: string
}

export interface TimeHTMLAttributes extends HTMLAttributes {
    datetime?: string
}

export interface TrackHTMLAttributes extends HTMLAttributes {
    default?: boolean
    kind?: string
    label?: string
    src?: string
    srclang?: string
}

export interface VideoHTMLAttributes extends MediaHTMLAttributes {
    height?: number | string
    playsinline?: boolean
    poster?: string
    width?: number | string
}

export interface AllHTMLAttributes extends HTMLAttributes {
    accept?: string
    acceptcharset?: string
    action?: boolean
    allowfullscreen?: boolean
    allowtransparency?: boolean
    alt?: string
    async?: boolean
    autocomplete?: string
    autofocus?: boolean
    autoplay?: boolean
    capture?: boolean // https://www.w3.org/tr/html-media-capture/#the-capture-attribute
    cellpadding?: number | string
    cellspacing?: number | string
    challenge?: string
    charset?: string
    checked?: boolean
    cite?: string
    classid?: string
    cols?: number
    colspan?: number
    content?: string
    controls?: boolean
    coord?: string
    crossorigin?: string
    data?: string
    datetime?: string
    default?: boolean
    defer?: boolean
    dirname?: string
    disabled?: boolean
    download?: any
    enctype?: string
    form?: string
    formaction?: string
    formenctype?: string
    formmethod?: string
    formnovalidate?: boolean
    formtarget?: string
    frameborder?: number | string
    headers?: string
    height?: number | string
    high?: number
    href?: string
    hreflang?: string
    htmlfor?: string
    httpequiv?: string
    integrity?: string
    keyparams?: string
    keytype?: string
    kind?: string
    label?: string
    list?: string
    loop?: boolean
    low?: number
    manifest?: string
    marginheight?: number
    marginwidth?: number
    max?: number | string
    maxlength?: number
    media?: string
    mediagroup?: string
    method?: string
    min?: number | string
    minlength?: number
    multiple?: boolean
    muted?: boolean
    name?: string
    nonce?: string
    novalidate?: boolean
    open?: boolean
    optimum?: number
    pattern?: string
    placeholder?: string
    playsinline?: boolean
    poster?: string
    preload?: string
    readonly?: boolean
    rel?: string
    required?: boolean
    reversed?: boolean
    rows?: number
    rowspan?: number
    sandbox?: string
    scope?: string
    scoped?: boolean
    scrolling?: string
    seamless?: boolean
    selected?: boolean
    shape?: string
    size?: number
    sizes?: string
    span?: number
    src?: string
    srcdoc?: string
    srclang?: string
    srcset?: string
    start?: number
    step?: number | string
    summary?: string
    target?: string
    type?: string
    usemap?: string
    value?: string | string[] | number
    width?: number | string
    wmode?: string
    wrap?: string
}

export interface IntrinsicElementAttributes {
    a: AnchorHTMLAttributes
    abbr: HTMLAttributes
    address: HTMLAttributes
    area: AreaHTMLAttributes
    article: HTMLAttributes
    aside: HTMLAttributes
    audio: AudioHTMLAttributes
    b: HTMLAttributes
    base: BaseHTMLAttributes
    bdi: HTMLAttributes
    bdo: HTMLAttributes
    big: HTMLAttributes
    blockquote: BlockquoteHTMLAttributes
    body: HTMLAttributes
    br: HTMLAttributes
    button: ButtonHTMLAttributes
    canvas: CanvasHTMLAttributes
    caption: HTMLAttributes
    cite: HTMLAttributes
    code: HTMLAttributes
    col: ColHTMLAttributes
    colgroup: ColgroupHTMLAttributes
    data: HTMLAttributes
    datalist: HTMLAttributes
    dd: HTMLAttributes
    del: DelHTMLAttributes
    details: DetailsHTMLAttributes
    dfn: HTMLAttributes
    dialog: HTMLAttributes
    div: HTMLAttributes
    dl: HTMLAttributes
    dt: HTMLAttributes
    em: HTMLAttributes
    embed: EmbedHTMLAttributes
    fieldset: FieldsetHTMLAttributes
    figcaption: HTMLAttributes
    figure: HTMLAttributes
    footer: HTMLAttributes
    form: FormHTMLAttributes
    h1: HTMLAttributes
    h2: HTMLAttributes
    h3: HTMLAttributes
    h4: HTMLAttributes
    h5: HTMLAttributes
    h6: HTMLAttributes
    head: HTMLAttributes
    header: HTMLAttributes
    hgroup: HTMLAttributes
    hr: HTMLAttributes
    html: HtmlHTMLAttributes
    i: HTMLAttributes
    iframe: IframeHTMLAttributes
    img: ImgHTMLAttributes
    input: InputHTMLAttributes
    ins: InsHTMLAttributes
    kbd: HTMLAttributes
    keygen: KeygenHTMLAttributes
    label: LabelHTMLAttributes
    legend: HTMLAttributes
    li: LiHTMLAttributes
    link: LinkHTMLAttributes
    main: HTMLAttributes
    map: MapHTMLAttributes
    mark: HTMLAttributes
    menu: MenuHTMLAttributes
    menuitem: HTMLAttributes
    meta: MetaHTMLAttributes
    meter: MeterHTMLAttributes
    nav: HTMLAttributes
    noscript: HTMLAttributes
    object: ObjectHTMLAttributes
    ol: OlHTMLAttributes
    optgroup: OptgroupHTMLAttributes
    option: OptionHTMLAttributes
    output: OutputHTMLAttributes
    p: HTMLAttributes
    param: ParamHTMLAttributes
    picture: HTMLAttributes
    pre: HTMLAttributes
    progress: ProgressHTMLAttributes
    q: QuoteHTMLAttributes
    rp: HTMLAttributes
    rt: HTMLAttributes
    ruby: HTMLAttributes
    s: HTMLAttributes
    samp: HTMLAttributes
    script: ScriptHTMLAttributes
    section: HTMLAttributes
    select: SelectHTMLAttributes
    small: HTMLAttributes
    source: SourceHTMLAttributes
    span: HTMLAttributes
    strong: HTMLAttributes
    style: StyleHTMLAttributes
    sub: HTMLAttributes
    summary: HTMLAttributes
    sup: HTMLAttributes
    table: TableHTMLAttributes
    tbody: HTMLAttributes
    td: TdHTMLAttributes
    textarea: TextareaHTMLAttributes
    tfoot: HTMLAttributes
    th: ThHTMLAttributes
    thead: HTMLAttributes
    time: TimeHTMLAttributes
    title: HTMLAttributes
    tr: HTMLAttributes
    track: TrackHTMLAttributes
    u: HTMLAttributes
    ul: HTMLAttributes
    var: HTMLAttributes
    video: VideoHTMLAttributes
    wbr: HTMLAttributes
}
