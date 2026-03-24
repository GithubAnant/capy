import { glob } from "glob";
import { basename, join } from "path";
import { readText, toPosixPath } from "./files.js";
const COMPONENT_FAMILIES = [
    {
        section: "Actions",
        label: "actions",
        searchTerms: ["Button", "IconButton", "LinkButton", "CTA", "SubmitButton", "ActionButton"],
        critical: true,
    },
    {
        section: "Inputs",
        label: "inputs",
        searchTerms: ["Input", "TextField", "Textarea", "Select", "Checkbox", "Radio", "Switch", "Combobox", "FormField"],
        critical: true,
    },
    {
        section: "Navigation",
        label: "navigation",
        searchTerms: ["Tabs", "Breadcrumb", "Pagination", "Nav", "Menu", "Sidebar"],
    },
    {
        section: "Data Display",
        label: "data display",
        searchTerms: ["Card", "Badge", "Chip", "Avatar", "Table", "List", "Stat", "EmptyState"],
    },
    {
        section: "Feedback",
        label: "feedback",
        searchTerms: ["Toast", "Toaster", "Snackbar", "Alert", "Banner", "Skeleton", "Progress", "Spinner"],
        contentPatterns: [/toast\(/i, /\buseToast\b/i, /\bToaster\b/i, /\bSnackbar\b/i],
        critical: true,
    },
    {
        section: "Overlays",
        label: "overlays",
        searchTerms: ["Dialog", "Modal", "Drawer", "Sheet", "Popover", "Tooltip", "Dropdown"],
        critical: true,
    },
];
export async function buildComponentDiscoveryPlan(projectRoot, projectFacts) {
    const files = await readDiscoveryFiles(projectRoot, projectFacts);
    const familyHits = COMPONENT_FAMILIES.map((family) => ({
        family,
        hits: findFamilyHits(files, family).slice(0, 3),
    }));
    const searchStepTargets = familyHits.map(({ family, hits }) => {
        const termList = family.searchTerms.slice(0, 4).join(", ");
        if (hits.length === 0) {
            return `${family.section}: search ${termList}`;
        }
        return `${family.section}: search ${termList}; candidates ${hits.map((hit) => hit.path).join(", ")}`;
    });
    const prioritizedFiles = unique(familyHits.flatMap(({ hits }) => hits.map((hit) => hit.path))).slice(0, 10);
    const discoveredFamilyFacts = familyHits
        .filter(({ hits }) => hits.length > 0)
        .slice(0, 4)
        .map(({ family, hits }) => {
        const paths = hits.map((hit) => hit.path).join(", ");
        return `Likely ${family.label} files: ${paths}.`;
    });
    const missingFamilyGaps = familyHits
        .filter(({ family, hits }) => family.critical && hits.length === 0)
        .map(({ family }) => {
        const terms = family.searchTerms.slice(0, 6).join(", ");
        if (family.section === "Feedback") {
            return `No feedback candidates were detected. Search for ${terms}, toast(), useToast, providers, or real usage sites before leaving Feedback empty.`;
        }
        return `No ${family.label} candidates were detected. Search for ${terms} and real usage examples before deciding the ${family.section} section is absent.`;
    });
    const instruction = buildInstruction(prioritizedFiles);
    return {
        searchStepTargets,
        prioritizedFiles,
        discoveredFamilyFacts,
        missingFamilyGaps,
        instruction,
    };
}
async function readDiscoveryFiles(projectRoot, projectFacts) {
    const sourceFiles = await glob(["**/*.{ts,tsx,js,jsx}"], {
        cwd: projectRoot,
        nodir: true,
        ignore: [
            "**/*.test.*",
            "**/*.spec.*",
            "**/*.stories.*",
            "**/*.story.*",
            "**/node_modules/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
            "**/.git/**",
            "**/.capy/**",
            "**/preview/**",
        ],
    });
    const sourceRoots = new Set([
        ...projectFacts.likelyComponentDirs,
        ...projectFacts.likelyPageDirs,
        ...projectFacts.likelyUiDirs,
        "src",
        "app",
        "pages",
        "routes",
        "components",
        "ui",
        "features",
    ]);
    const filteredFiles = sourceFiles
        .map((file) => toPosixPath(file))
        .filter((file) => {
        if (!file.includes("/"))
            return false;
        return Array.from(sourceRoots).some((root) => file === root || file.startsWith(`${root}/`));
    })
        .sort();
    return Promise.all(filteredFiles.map(async (relativePath) => {
        const contents = (await readText(join(projectRoot, relativePath))) ?? "";
        return {
            path: relativePath,
            basename: basename(relativePath).replace(/\.[^.]+$/, ""),
            exports: extractExportCandidates(contents),
            contents,
        };
    }));
}
function findFamilyHits(files, family) {
    const hits = [];
    for (const file of files) {
        const matchedTerms = new Set();
        let score = 0;
        for (const term of family.searchTerms) {
            if (matchesFile(file, term)) {
                matchedTerms.add(term);
                score += scoreTerm(file, term);
            }
        }
        for (const pattern of family.contentPatterns ?? []) {
            if (pattern.test(file.contents)) {
                matchedTerms.add(pattern.source);
                score += 2;
            }
        }
        if (score === 0)
            continue;
        if (file.path.includes("/components/") || file.path.includes("/ui/")) {
            score += 2;
        }
        hits.push({
            path: file.path,
            score,
            matchedTerms: Array.from(matchedTerms),
        });
    }
    return hits.sort((left, right) => right.score - left.score || left.path.localeCompare(right.path));
}
function matchesFile(file, term) {
    const lowerTerm = term.toLowerCase();
    const lowerPath = file.path.toLowerCase();
    const lowerBasename = file.basename.toLowerCase();
    if (lowerBasename === lowerTerm || lowerBasename.endsWith(lowerTerm))
        return true;
    if (lowerPath.includes(`/${lowerTerm}.`) || lowerPath.includes(`/${lowerTerm}/`))
        return true;
    if (file.exports.some((exportName) => exportName.toLowerCase() === lowerTerm))
        return true;
    if (file.exports.some((exportName) => exportName.toLowerCase().includes(lowerTerm)))
        return true;
    return new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(file.contents);
}
function scoreTerm(file, term) {
    const lowerTerm = term.toLowerCase();
    const lowerBasename = file.basename.toLowerCase();
    if (lowerBasename === lowerTerm)
        return 8;
    if (lowerBasename.endsWith(lowerTerm))
        return 6;
    if (file.exports.some((exportName) => exportName.toLowerCase() === lowerTerm))
        return 6;
    if (file.exports.some((exportName) => exportName.toLowerCase().includes(lowerTerm)))
        return 4;
    return 2;
}
function buildInstruction(prioritizedFiles) {
    const searchLead = "After the first local scan, actively search the repo for real buttons, inputs, selects, tabs, cards, badges, dialogs, popovers, tooltips, dropdowns, toasts/snackbars, alerts, skeletons, and loading or empty states.";
    const usageLead = "Use actual component files and usage examples. If you only find hooks or providers, trace one real usage path and mirror that behavior in /preview instead of inventing a fake specimen.";
    const placementLead = "Place every real family you find into the matching preview section. If a family is absent, label it as not present in the repo.";
    if (prioritizedFiles.length === 0) {
        return `${searchLead} ${usageLead} ${placementLead}`;
    }
    return `${searchLead} Start with ${prioritizedFiles.slice(0, 6).join(", ")}. ${usageLead} ${placementLead}`;
}
function extractExportCandidates(contents) {
    const exportNames = new Set();
    const patterns = [
        /export\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+const\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+class\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(contents)) !== null) {
            exportNames.add(match[1]);
        }
    }
    return Array.from(exportNames);
}
function unique(values) {
    return Array.from(new Set(values));
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
