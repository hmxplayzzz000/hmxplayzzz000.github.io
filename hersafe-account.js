/* ==========================================
   HER SAFE ACCOUNT SYSTEM
   CLERK VERSION  (rewritten)

   This file is the ONLY place Clerk is
   loaded. Do not add Clerk <script> tags
   to your HTML pages as well, or Clerk
   will load twice and the sign-up /
   log-in windows will fail to open.

   Just add this to every page:
   <script src="hersafe-account.js"></script>
========================================== */


/* ==========================================
   YOUR CLERK SETTINGS
========================================== */

const HERSAFE_CLERK_KEY =
    "pk_test_anVzdC1tYWtvLTI4MzcuY2xlcmsuYWNjb3VudHMuZGV2JA";

const HERSAFE_CLERK_DOMAIN =
    "just-mako-2837.clerk.accounts.dev";

const HERSAFE_CLERK_SRC =
    "https://" +
    HERSAFE_CLERK_DOMAIN +
    "/npm/@clerk/clerk-js@5/dist/clerk.browser.js";


let clerkReady = false;

let herSafeClerkPromise = null;


/* ==========================================
   LOAD CLERK  (once only)
========================================== */

function waitForClerk() {

    if (herSafeClerkPromise) {

        return herSafeClerkPromise;

    }


    herSafeClerkPromise = new Promise(

        function (resolve, reject) {

            /*
             * Step 1:
             * make sure the Clerk script
             * is on the page.
             */

            const alreadyThere =
                document.querySelector(
                    "script[data-clerk-publishable-key]"
                );


            if (!alreadyThere) {

                const script =
                    document.createElement("script");

                script.setAttribute(
                    "data-clerk-publishable-key",
                    HERSAFE_CLERK_KEY
                );

                script.setAttribute(
                    "crossorigin",
                    "anonymous"
                );

                script.async = true;

                script.src = HERSAFE_CLERK_SRC;

                script.onerror = function () {

                    reject(
                        new Error(
                            "The Clerk script could not be downloaded."
                        )
                    );

                };

                document.head.appendChild(script);

            }


            /*
             * Step 2:
             * wait until window.Clerk exists,
             * then start it.
             */

            let attempts = 0;

            const maxAttempts = 200;   // 20 seconds


            const checkClerk = setInterval(

                function () {

                    attempts++;


                    if (window.Clerk) {

                        clearInterval(checkClerk);


                        /*
                         * IMPORTANT:
                         * Clerk.load() is called with
                         * NO options. The old
                         * "ui: { ClerkUI: ... }" option
                         * was what stopped the sign-up
                         * and log-in windows opening.
                         */

                        window.Clerk
                            .load()
                            .then(function () {

                                clerkReady = true;

                                console.log(
                                    "HerSafe Clerk account system loaded 💜"
                                );

                                resolve(window.Clerk);

                            })
                            .catch(function (error) {

                                console.error(
                                    "HerSafe Clerk load error:",
                                    error
                                );

                                reject(error);

                            });

                        return;

                    }


                    if (attempts >= maxAttempts) {

                        clearInterval(checkClerk);

                        reject(
                            new Error(
                                "HerSafe could not find Clerk."
                            )
                        );

                    }

                },

                100

            );

        }

    );


    return herSafeClerkPromise;

}


/* ==========================================
   IS THE CLERK WINDOW ACTUALLY OPEN?
========================================== */

function clerkWindowIsOpen() {

    return Boolean(

        document.querySelector(
            ".cl-modalBackdrop, .cl-modalContent, .cl-rootBox, .cl-card"
        )

    );

}


/* ==========================================
   OPEN SIGN UP / SIGN IN
   (modal first, inline form as backup)
========================================== */

async function openHerSafeAuth(mode) {

    const clerk = await waitForClerk();


    const fallbackBox =
        document.getElementById("clerkMount");


    /*
     * Clerk sometimes resolves .load() a moment
     * before its internal "client" object (the
     * thing that actually knows how to open the
     * sign-up / sign-in window) exists. Give it
     * a few extra tries instead of crashing.
     */

    let waited = 0;

    while (!clerk.client && waited < 3000) {

        await new Promise(function (r) {
            setTimeout(r, 150);
        });

        waited += 150;

    }


    if (!clerk.client) {

        throw new Error(
            "Clerk did not finish starting up (no client). " +
            "This usually means sign-up / sign-in has no " +
            "identifier enabled in the Clerk dashboard " +
            "(User & authentication \u2192 Email, phone, username)."
        );

    }


    /*
     * Try the pop-up window first.
     */

    try {

        if (mode === "signUp") {

            clerk.openSignUp({});

        } else {

            clerk.openSignIn({});

        }

    } catch (error) {

        console.error(
            "Clerk window error:",
            error
        );


        throw error;

    }


    /*
     * If the pop-up did not appear after
     * 1.2 seconds, show the form directly
     * inside the page instead.
     */

    return new Promise(function (resolve) {

        setTimeout(function () {

            if (clerkWindowIsOpen()) {

                resolve("modal");

                return;

            }


            if (fallbackBox) {

                fallbackBox.innerHTML = "";

                fallbackBox.style.display = "block";


                if (mode === "signUp") {

                    clerk.mountSignUp(fallbackBox);

                } else {

                    clerk.mountSignIn(fallbackBox);

                }


                fallbackBox.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


                resolve("inline");

                return;

            }


            resolve("failed");

        }, 1200);

    });

}


/* ==========================================
   GET CURRENT USER
========================================== */

async function currentUser() {

    const clerk = await waitForClerk();


    if (!clerk || !clerk.user) {

        return null;

    }


    const user = clerk.user;


    const name =
        user.username ||
        (user.primaryEmailAddress
            ? user.primaryEmailAddress.emailAddress
            : null) ||
        user.firstName ||
        "HerSafe User";


    return {

        id: user.id,

        username: name

    };

}


/* ==========================================
   SIGN UP
========================================== */

async function signUp() {

    return openHerSafeAuth("signUp");

}


/* ==========================================
   LOG IN
========================================== */

async function logIn() {

    return openHerSafeAuth("signIn");

}


/* ==========================================
   LOG OUT
========================================== */

async function logOut() {

    const clerk = await waitForClerk();

    await clerk.signOut();


    console.log(
        "HerSafe account signed out 💜"
    );

}


/* ==========================================
   CHECK USERNAME
   (Clerk does this during sign-up)
========================================== */

async function isUsernameTaken(username) {

    if (!username || !username.trim()) {

        return false;

    }


    return false;

}


/* ==========================================
   SAVE QUIZ PROGRESS
   Saved onto the Clerk account itself,
   so it follows the user to any device.
========================================== */

async function saveProgress(progress) {

    const clerk = await waitForClerk();


    if (!clerk.user) {

        console.log(
            "No HerSafe account is signed in."
        );

        return false;

    }


    try {

        const existing =
            clerk.user.unsafeMetadata || {};


        await clerk.user.update({

            unsafeMetadata: Object.assign(
                {},
                existing,
                { quizProgress: progress }
            )

        });


        try {

            localStorage.setItem(
                "hersafe_progress_" + clerk.user.id,
                JSON.stringify(progress)
            );

        } catch (storageError) {

            /* private browsing - ignore */

        }


        console.log(
            "HerSafe quiz progress saved 💜"
        );


        return true;

    } catch (error) {

        console.error(
            "Could not save progress:",
            error
        );

        return false;

    }

}


/* ==========================================
   LOAD QUIZ PROGRESS
========================================== */

async function loadProgress() {

    const clerk = await waitForClerk();


    if (!clerk.user) {

        return null;

    }


    const meta =
        clerk.user.unsafeMetadata || {};


    if (meta.quizProgress) {

        return meta.quizProgress;

    }


    try {

        const saved = localStorage.getItem(
            "hersafe_progress_" + clerk.user.id
        );

        return saved
            ? JSON.parse(saved)
            : null;

    } catch (error) {

        return null;

    }

}


/* ==========================================
   CLEAR QUIZ PROGRESS
========================================== */

async function clearProgress() {

    const clerk = await waitForClerk();


    if (!clerk.user) {

        return false;

    }


    const existing =
        clerk.user.unsafeMetadata || {};


    const cleaned =
        Object.assign({}, existing);

    delete cleaned.quizProgress;


    await clerk.user.update({
        unsafeMetadata: cleaned
    });


    try {

        localStorage.removeItem(
            "hersafe_progress_" + clerk.user.id
        );

    } catch (error) {

        /* ignore */

    }


    return true;

}


/* ==========================================
   EXPOSE HER SAFE ACCOUNT SYSTEM
========================================== */

window.HerSafe = {

    waitForClerk,

    currentUser,

    signUp,

    logIn,

    logOut,

    isUsernameTaken,

    saveProgress,

    loadProgress,

    clearProgress,

    isReady: function () {
        return clerkReady;
    }

};


console.log(
    "HerSafe account system is ready 💜"
);
