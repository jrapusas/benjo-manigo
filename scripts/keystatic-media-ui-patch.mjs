/** Patch Keystatic collection table + Keystar TableView for media library previews. */

export const PATCH_MARKER = 'ks-media-table-v10';

export const VIRTUALIZER_PATCH_MARKER = 'ks-media-virtualizer-v2';

const THUMB_ON_LOAD = `onLoad: function (e) {
                  e.currentTarget.dispatchEvent(new CustomEvent("ks-media-thumb-loaded", { bubbles: true }));
                },`;

const MEDIA_TABLE_CELL =
  /return \/\*#__PURE__\*\/jsx\(Cell, \{\s*textValue: val,\s*children: \/\*#__PURE__\*\/jsx\(Text, \{\s*weight: "medium",\s*children: val\s*\}\)\s*\}, column_0 \+ item_0\.name\);/;

const MEDIA_TABLE_CELL_PATCHED =
  /return \/\*#__PURE__\*\/jsx\(Cell, \{\s*textValue: val,\s*children: props\.collection === "media" && column_0 === "file"[\s\S]*?\}, column_0 \+ item_0\.name\);/;

const MEDIA_TABLE_CELL_V3 = `return /*#__PURE__*/jsx(Cell, {
                textValue: val,
                children: props.collection === "media" && column_0 === "file" ? item_0.data && item_0.data.category === "icon" || item_0.name.startsWith("icon-") ? /*#__PURE__*/jsx("img", {
                  className: "ks-media-table-thumb ks-media-table-thumb--icon",
                  src: "/api/media-preview/" + encodeURIComponent(item_0.name),
                  alt: "",
                  ${THUMB_ON_LOAD}
                }) : val && String(val).endsWith(".svg") ? /*#__PURE__*/jsx("img", {
                  className: "ks-media-table-thumb ks-media-table-thumb--photo ks-media-table-thumb--vector",
                  src: val.startsWith("/") ? val : "/api/media-preview/" + encodeURIComponent(item_0.name),
                  alt: "",
                  ${THUMB_ON_LOAD}
                }) : val ? /*#__PURE__*/jsx("img", {
                  className: "ks-media-table-thumb ks-media-table-thumb--photo",
                  src: val.startsWith("/") ? val : "/api/media-preview/" + encodeURIComponent(item_0.name),
                  alt: "",
                  ${THUMB_ON_LOAD}
                }) : /*#__PURE__*/jsx(Text, {
                  weight: "medium",
                  children: val
                }) : /*#__PURE__*/jsx(Text, {
                  weight: "medium",
                  children: val
                })
              }, column_0 + item_0.name);`;

const COLLECTION_TABLE_OVERFLOW_WRAP =
  /overflowMode: props\.collection === "media" \? "wrap" : "truncate",/;

const COLLECTION_TABLE_OVERFLOW =
  /overflowMode: "truncate",/;

const TABLE_VIEW_ROW_HEIGHT =
  /rowHeight: props\.(?:mediaRowHeight \?\? \(props\.)?overflowMode === 'wrap' \? undefined : ROW_HEIGHTS\[density\],\s*estimatedRowHeight: props\.(?:mediaRowHeight != null \? undefined : props\.)?overflowMode === 'wrap' \? ROW_HEIGHTS\[density\] : undefined,/;

const TABLE_VIEW_ROW_HEIGHT_V3 =
  `rowHeight: props.mediaRowHeight ?? (props.overflowMode === 'wrap' ? undefined : ROW_HEIGHTS[density]),
    estimatedRowHeight: props.mediaRowHeight != null ? undefined : props.overflowMode === 'wrap' ? ROW_HEIGHTS[density] : undefined,`;

const TABLE_VIEW_LAYOUT_DEPS =
  /\}\), \[props\.overflowMode(?:, props\.mediaRowHeight)?, density\]\);/;

const TABLE_VIEW_BUILD_CELL =
  /buildCell\(node, x, y\) \{\s*var _node\$column;\s*let res = super\.buildCell\(node, x, y\);\s*if \(\(_node\$column = node\.column\) !== null && _node\$column !== void 0 && _node\$column\.props\.hideHeader\) res\.layoutInfo\.allowOverflow = true;\s*return res;\s*\}/;

const TABLE_VIEW_BUILD_CELL_PATCH = `buildCell(node, x, y) {
		let res = super.buildCell(node, x, y);
		res.layoutInfo.allowOverflow = true;
		return res;
	}`;

const MEDIA_FILE_COLUMN_RETURN =
  /return \{\s*name: ['"]label['"] in schema_0 && schema_0\.label \|\| column,\s*key: column\s*\};/;

const MEDIA_FILE_COLUMN_RETURN_PATCH = `return {
					name: "label" in schema_0 && schema_0.label || column,
					key: column,
					...(props.collection === "media" && column === "file" ? { minWidth: 300, width: 300 } : {})
				};`;

function stripOldMarkers(code) {
  return code.replace(/\/\* ks-media-table-v[0-9]+ \*\/\s*$/g, '');
}

function applyMediaCellPatch(code) {
  if (MEDIA_TABLE_CELL_PATCHED.test(code)) {
    return code.replace(MEDIA_TABLE_CELL_PATCHED, MEDIA_TABLE_CELL_V3);
  }
  if (MEDIA_TABLE_CELL.test(code)) {
    return code.replace(MEDIA_TABLE_CELL, MEDIA_TABLE_CELL_V3);
  }
  return code;
}

const COLLECTION_TABLE_MEDIA_FIXED_ROW =
  /overflowMode: "truncate",\s*mediaRowHeight: props\.collection === "media" \? \d+ : (?:undefined|void 0),/;

const COLLECTION_TABLE_MEDIA_ROW_HEIGHT_PROP =
  /\s*mediaRowHeight: props\.collection === "media" \? \d+ : (?:undefined|void 0),/;

const COLLECTION_TABLE_MEDIA_WRAP =
  'overflowMode: props.collection === "media" ? "wrap" : "truncate",';

function applyCollectionTableRowHeight(code) {
  let patched = code.replace(COLLECTION_TABLE_MEDIA_FIXED_ROW, COLLECTION_TABLE_MEDIA_WRAP);
  patched = patched.replace(COLLECTION_TABLE_OVERFLOW_WRAP, COLLECTION_TABLE_MEDIA_WRAP);
  if (!patched.includes('props.collection === "media" ? "wrap"')) {
    patched = patched.replace(COLLECTION_TABLE_OVERFLOW, COLLECTION_TABLE_MEDIA_WRAP);
  }
  patched = patched.replace(COLLECTION_TABLE_MEDIA_ROW_HEIGHT_PROP, '');
  return patched;
}

function applyMediaFileColumnWidth(code) {
  if (code.includes('column === "file" ? { minWidth: 300')) return code;
  return code.replace(MEDIA_FILE_COLUMN_RETURN, MEDIA_FILE_COLUMN_RETURN_PATCH);
}

function applyTableViewLayoutCellOverflow(code) {
  if (TABLE_VIEW_BUILD_CELL.test(code)) {
    return code.replace(TABLE_VIEW_BUILD_CELL, TABLE_VIEW_BUILD_CELL_PATCH);
  }
  return code;
}

function applyMinifiedMediaThumbOnLoad(code) {
  if (code.includes('ks-media-thumb-loaded')) return code;
  const onLoad = `,
								onLoad: function (e) {
									e.currentTarget.dispatchEvent(new CustomEvent("ks-media-thumb-loaded", { bubbles: true }));
								}`;
  return code.replace(
    /(className: "ks-media-table-thumb[^"]*",[\s\S]*?alt: "")(\n\t+\}\))/g,
    `$1${onLoad}$2`,
  );
}

function applyTableViewRowHeight(code) {
  let patched = code.replace(TABLE_VIEW_ROW_HEIGHT, TABLE_VIEW_ROW_HEIGHT_V3);
  patched = patched.replace(
    TABLE_VIEW_LAYOUT_DEPS,
    '}), [props.overflowMode, props.mediaRowHeight, density]);',
  );
  return patched;
}

function applyMediaRowIndexColumn(code) {
  if (code.includes('@@rowIndex')) return code;

  if (code.includes("const STATUS = '@@status';")) {
    code = code.replace(
      "const STATUS = '@@status';",
      "const STATUS = '@@status';\nconst ROW_INDEX = '@@rowIndex';",
    );
  } else if (code.includes('var STATUS = "@@status";')) {
    code = code.replace(
      'var STATUS = "@@status";',
      'var STATUS = "@@status";\nvar ROW_INDEX = "@@rowIndex";',
    );
  }

  const slugColumnNeedle = `{
        name: 'Slug',
        key: SLUG
      }, ...collection.columns.map(column => {`;
  const slugColumnPatched = `{
        name: 'Slug',
        key: SLUG
      }, ...(props.collection === "media" ? [{
        name: '#',
        key: ROW_INDEX,
        minWidth: 48,
        width: 48
      }] : []), ...collection.columns.map(column => {`;

  const slugColumnNeedleMin = `{
				name: "Slug",
				key: SLUG
			},
			...collection.columns.map((column) => {`;
  const slugColumnPatchedMin = `{
				name: "Slug",
				key: SLUG
			},
			...(props.collection === "media" ? [{
				name: "#",
				key: ROW_INDEX,
				minWidth: 48,
				width: 48
			}] : []),
			...collection.columns.map((column) => {`;

  if (code.includes(slugColumnNeedle)) {
    code = code.replace(slugColumnNeedle, slugColumnPatched);
  } else if (code.includes(slugColumnNeedleMin)) {
    code = code.replace(slugColumnNeedleMin, slugColumnPatchedMin);
  }

  const indexCellSource = `}, SLUG + item_0.name);
        const rowIndex = sortedItems.findIndex(x => x.name === item_0.name) + 1;
        const indexCell = /*#__PURE__*/jsx(Cell, {
          textValue: String(rowIndex),
          children: /*#__PURE__*/jsx(Text, {
            weight: "medium",
            children: String(rowIndex)
          })
        }, ROW_INDEX + item_0.name);
        if ((_collection$columns3 = collection.columns)`;

  const indexCellMin = `}, SLUG + item_0.name);
				const rowIndex = sortedItems.findIndex((x) => x.name === item_0.name) + 1;
				const indexCell = /*#__PURE__*/ (0, import_jsx_runtime.jsx)($bf42fa5f8ac488ca$export$f6f0c3fe4ec306ea, {
					textValue: String(rowIndex),
					children: /*#__PURE__*/ (0, import_jsx_runtime.jsx)(Text, {
						weight: "medium",
						children: String(rowIndex)
					})
				}, ROW_INDEX + item_0.name);
				if ((_collection$columns3 = collection.columns)`;

  if (code.includes('ROW_INDEX + item_0.name')) return code;

  if (code.includes('}, SLUG + item_0.name);\n        if ((_collection$columns3 = collection.columns)')) {
    code = code.replace(
      '}, SLUG + item_0.name);\n        if ((_collection$columns3 = collection.columns)',
      indexCellSource,
    );
  } else if (
    code.includes('}, SLUG + item_0.name);\n				if ((_collection$columns3 = collection.columns)')
  ) {
    code = code.replace(
      '}, SLUG + item_0.name);\n				if ((_collection$columns3 = collection.columns)',
      indexCellMin,
    );
  }

  const rowChildrenNeedle = 'nameCell,\n            ...collection.columns.map(column_0 => {';
  const rowChildrenPatched =
    'nameCell,\n            ...(props.collection === "media" ? [indexCell] : []),\n            ...collection.columns.map(column_0 => {';

  const rowChildrenNeedleMin =
    'nameCell,\n					...collection.columns.map((column_0) => {';
  const rowChildrenPatchedMin =
    'nameCell,\n					...(props.collection === "media" ? [indexCell] : []),\n					...collection.columns.map((column_0) => {';

  if (code.includes(rowChildrenNeedle)) {
    code = code.replace(rowChildrenNeedle, rowChildrenPatched);
  } else if (code.includes(rowChildrenNeedleMin)) {
    code = code.replace(rowChildrenNeedleMin, rowChildrenPatchedMin);
  }

  return code;
}

function mediaUiPatchComplete(code) {
  return (
    code.includes(PATCH_MARKER) &&
    code.includes('ks-media-thumb-loaded') &&
    (!code.includes('buildCell(node, x, y)') ||
      code.includes('res.layoutInfo.allowOverflow = true')) &&
    code.includes('column === "file" ? { minWidth: 300') &&
    code.includes('@@rowIndex')
  );
}

export function patchKeystaticMediaUI(code) {
  if (mediaUiPatchComplete(code)) return code;

  let patched = stripOldMarkers(code);
  patched = applyMediaCellPatch(patched);
  patched = applyCollectionTableRowHeight(patched);
  patched = applyMediaFileColumnWidth(patched);
  patched = applyTableViewLayoutCellOverflow(patched);
  patched = applyMinifiedMediaThumbOnLoad(patched);
  patched = applyMediaRowIndexColumn(patched);
  if (patched.includes('function CollectionTable') && !patched.includes(PATCH_MARKER)) {
    patched = `${patched}\n/* ${PATCH_MARKER} */`;
  }
  return patched;
}

export function patchKeystarTableUI(code) {
  if (code.includes(PATCH_MARKER)) return code;

  let patched = stripOldMarkers(code);
  patched = applyTableViewRowHeight(patched);
  if (patched.includes('function TableView')) {
    patched = `${patched}\n/* ${PATCH_MARKER} */`;
  }
  return patched;
}

export function isKeystaticCoreUiId(id) {
  return id.includes('keystatic-core-ui');
}

export function isKeystarTableUiId(id) {
  return id.includes('keystar-ui-table');
}

export function patchUseVirtualizerItem(code) {
  if (code.includes(VIRTUALIZER_PATCH_MARKER)) return code;

  let patched = code.replace(
    'import {useCallback as $8najZ$useCallback} from "react";',
    'import {useCallback as $8najZ$useCallback, useEffect as $8najZ$useEffect} from "react";',
  );

  const layoutEffectBlock =
    /\(0, \$c4867b2f328c2698\$export\$e5c5a5f917a5871c\)\(\(\)=>\{\s*if \(layoutInfo\?\.estimatedSize\) updateSize\(\);\s*\}\);\s*return \{\s*updateSize: updateSize\s*\};/;

  const withThumbLoadRemeasure = `(0, $c4867b2f328c2698$export$e5c5a5f917a5871c)(() => {
        if (layoutInfo?.estimatedSize) updateSize();
    });
    (0, $8najZ$useEffect)(() => {
        const onThumbLoad = (e) => {
            const target = e.target;
            if (!(target instanceof HTMLImageElement)) return;
            if (!target.classList.contains("ks-media-table-thumb")) return;
            if (!ref.current?.contains(target)) return;
            updateSize();
        };
        document.addEventListener("load", onThumbLoad, true);
        document.addEventListener("ks-media-thumb-loaded", onThumbLoad, true);
        return () => {
            document.removeEventListener("load", onThumbLoad, true);
            document.removeEventListener("ks-media-thumb-loaded", onThumbLoad, true);
        };
    }, [updateSize, ref]);
    return {
        updateSize: updateSize
    };`;

  if (!layoutEffectBlock.test(patched)) return code;
  patched = patched.replace(layoutEffectBlock, withThumbLoadRemeasure);
  return `${patched}\n/* ${VIRTUALIZER_PATCH_MARKER} */\n`;
}

export function patchKeystaticBundle(code, id) {
  if (id.includes('useVirtualizerItem.mjs')) return patchUseVirtualizerItem(code);
  if (isKeystaticCoreUiId(id)) return patchKeystaticMediaUI(code);
  if (isKeystarTableUiId(id)) return patchKeystarTableUI(code);
  return code;
}
