// lib/safeConsole.ts

if (process.env.NODE_ENV === "production") {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Optional: keep warnings and errors
    // console.warn = () => {};
    // console.error = () => {};
  }
  