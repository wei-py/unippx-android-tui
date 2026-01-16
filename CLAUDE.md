# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**uniappx-tui** is a CLI scaffolding tool for generating Android native projects for UniApp X offline packaging. It's built with React Ink (terminal UI) and TypeScript, allowing users to configure and generate complete Android projects through an interactive terminal interface.

## Build & Development Commands

```bash
# Development (run directly with tsx)
npm run dev

# Build TypeScript to dist/
npm run build

# Run compiled version
npm start
# Or specify output directory:
OUTPUT_DIR=/path/to/output npm start
```

## Architecture

### Application Flow (3-Screen Process)

The app uses a state machine with three screens (`App.tsx`):
1. **config** → ConfigEditor: Edit project configuration (package name, app ID, SDK paths, version numbers)
2. **modules** → SdkSelector: Select optional SDK modules (storage, network, camera, maps, ads, etc.)
3. **generate** → Generator: Generate the Android project with all files and dependencies

Configuration is automatically saved to `.uniappx.env` after each edit.

### Key Data Structures

**EnvConfig** (`src/utils/env.ts`):
- Project metadata: `PROJECT_NAME`, `PACKAGE_NAME`, `APP_ID`, `PROJECT_PATH`
- SDK paths: `SDK_PATH`, `PLUGINS_PATH`
- Build versions: `GRADLE_VERSION`, `KOTLIN_VERSION`, `AGP_VERSION`, `COMPILE_SDK`, etc.
- Selected modules: `SELECTED_MODULES` (array of module identifiers)

**SDK Module System** (`src/data/sdk-modules.js`):
- `BASE_MODULES`: 19 required core AAR files (mandatory for all projects)
- `OPTIONAL_MODULES`: Array of `{name, displayName, description, files[]}` for features like storage, network, camera, payment, ads
- `MANIFEST_MODULE_MAPPING`: Maps manifest.json module names to internal module identifiers
- `getModulesFromManifest()`: Auto-detects required modules from UniApp X project's manifest.json

### Project Generation (`src/components/Generator.tsx`)

The generator creates a complete Android Gradle project with this critical dual-AAR strategy:

**AAR Distribution Strategy:**
- `app/libs/`: All required AAR files (base + selected modules)
- `uniappx/libs/`: Only the 19 core BASE_MODULES AAR files

**Why both?** The `uniappx` module contains Kotlin code (copied from UniApp X project) that requires SDK dependencies to compile. Library modules cannot access parent project dependencies, so core AARs must be duplicated in `uniappx/libs`.

**Generated Structure:**
```
ProjectName/
├── app/                    # Main application module
│   ├── build.gradle       # Includes 'io.dcloud.uts.kotlin' plugin
│   └── libs/              # All AAR files
├── uniappx/               # Library module for UniApp X resources
│   ├── build.gradle       # Includes 'io.dcloud.uts.kotlin' plugin + full dependencies
│   ├── libs/              # 19 core AAR files (for Kotlin compilation)
│   └── src/main/
│       ├── assets/apps/   # UniApp X compiled resources
│       └── java/          # Kotlin source from UniApp X project
├── resources/             # Bundled build tools
│   ├── Sdk/               # Android SDK (cmdline-tools)
│   ├── gradle-8.4/        # Gradle distribution
│   └── plugins/           # UTS Kotlin compiler plugins (.jar)
├── build.gradle           # Root build script with UTS plugins
├── settings.gradle
├── gradlew / gradlew.bat  # Custom wrappers pointing to resources/gradle-8.4
└── local.properties       # Points to resources/Sdk
```

### Version Configuration Critical Notes

**Current SDK Reality (as of SDK 4.87):**
- DCloud's official documentation states正式版 uses Kotlin 1.9.10
- **However**, actual SDK AAR files are compiled with Kotlin 2.2.0 (metadata version 2.2.0)
- This mismatch causes `incompatible version of Kotlin` errors if you use 1.9.10

**Correct Configuration:**
```
KOTLIN_VERSION="2.2.0"     # Match actual SDK compilation version
AGP_VERSION="8.2.2"        # Supports Kotlin 2.2.0
GRADLE_VERSION="8.4"       # Official recommendation
```

The `DEFAULT_CONFIG` in `src/utils/env.ts` uses these values. If SDK updates change the Kotlin version, update BASE_MODULES AAR filenames and version config together.

### UTS Kotlin Plugin

Both `app` and `uniappx` modules **must** include:
```gradle
plugins {
    id 'io.dcloud.uts.kotlin'  // Required for _uM and other UTS syntax
}
```

This plugin is loaded from `plugins/uts-kotlin-*.jar` files and enables DCloud's UTS (UniTypeScript) compilation.

### Resource Copying Logic

**From UniApp X Project** (`unpackage/resources/app-android/`):
1. Assets: `{appid}/` → `uniappx/src/main/assets/apps/{appid}/`
2. Kotlin source: `uniappx/app-android/src/` → `uniappx/src/main/java/`
3. Icons: From manifest.json paths → `app/src/main/res/mipmap-*/`

**From Internal Resources:**
1. `resources/` → `{project}/resources/` (entire directory)
2. SDK licenses auto-generated in `resources/Sdk/licenses/`

### AndroidManifest.xml Generation

- **app/AndroidManifest.xml**: Includes permissions from manifest.json's `app-android.distribute.permissions[]`
- **uniappx/AndroidManifest.xml**: Empty placeholder (library module)

## Important File Mappings

- `src/data/sdk-modules.js` → Module definitions and BASE_MODULES list
- `src/components/Generator.tsx` → All template generation logic
- `src/utils/env.ts` → Configuration schema and I/O
- `.uniappx.env` → User's saved configuration (git-ignored)

## Critical AAR File Version

`android-gif-drawable-1.2.29.aar` - Note the version number is part of the filename. If SDK updates change this, update `BASE_MODULES` array.

## Common Pitfalls

1. **Missing AAR in uniappx/libs**: Kotlin compilation will fail with unresolved references (`VueComponent`, `UTSArray`, etc.)
2. **Kotlin version mismatch**: Always verify actual SDK AAR metadata version vs. documentation
3. **Missing UTS plugin**: Both modules need `id 'io.dcloud.uts.kotlin'` or build fails with `Unresolved reference: _uM`
4. **Wrong Gradle wrapper paths**: Custom wrappers point to `resources/gradle-{version}`, not system Gradle

## TypeScript Configuration

Uses ES Modules (`"type": "module"` in package.json):
- All imports need `.js` extensions (even for `.ts` files)
- NodeNext module resolution
- JSX: `react-jsx`
