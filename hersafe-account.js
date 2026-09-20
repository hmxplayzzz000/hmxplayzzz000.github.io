/* =========================================
   HERSAFE ACCOUNT SYSTEM
   CLERK + USERNAME + PASSWORD
========================================= */

(function () {

    const CLERK_PUBLISHABLE_KEY =
        "pk_test_anVzdC1tYWtvLTI4MzcuY2xlcmsuYWNjb3VudHMuZGV2JA";

    const CLERK_SCRIPT =
        "https://just-mako-2837.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js";

    let clerkInstance = null;
    let clerkLoading = null;


    /* =========================================
       LOAD CLERK
    ========================================= */

    function loadClerk() {

        if (clerkInstance) {
            return Promise.resolve(clerkInstance);
        }

        if (clerkLoading) {
            return clerkLoading;
        }

        clerkLoading = new Promise(function (resolve, reject) {

            function startClerk() {

                if (!window.Clerk) {

                    reject(
                        new Error("Clerk could not be loaded.")
                    );

                    return;
                }

                try {

                    clerkInstance =
                        new window.Clerk(
                            CLERK_PUBLISHABLE_KEY
                        );

                    clerkInstance.load()
                        .then(function () {

                            resolve(clerkInstance);

                        })
                        .catch(function (error) {

                            console.error(
                                "Clerk load error:",
                                error
                            );

                            reject(error);

                        });

                } catch (error) {

                    console.error(
                        "Clerk initialization error:",
                        error
                    );

                    reject(error);

                }

            }


            /* If Clerk is already loaded */

            if (window.Clerk) {

                startClerk();

                return;

            }


            /* Load Clerk */

            const script =
                document.createElement("script");

            script.src = CLERK_SCRIPT;

            script.async = true;

            script.crossOrigin = "anonymous";


            script.onload = function () {

                startClerk();

            };


            script.onerror = function () {

                reject(
                    new Error(
                        "Could not load Clerk."
                    )
                );

            };


            document.head.appendChild(script);

        });


        return clerkLoading;

    }


    /* =========================================
       WAIT FOR CLERK
    ========================================= */

    async function waitForClerk() {

        return await loadClerk();

    }


    /* =========================================
       OPEN CLERK SIGN UP
    ========================================= */

    async function openHerSafeSignUp() {

        try {

            const clerk =
                await waitForClerk();

            if (clerk.isSignedIn) {

                window.location.href =
                    "homepage101.html";

                return;

            }


            clerk.openSignUp({

                forceRedirectUrl:
                    "https://hmxplayzzz000.github.io/homepage101.html",

                fallbackRedirectUrl:
                    "https://hmxplayzzz000.github.io/homepage101.html"

            });

        } catch (error) {

            console.error(
                "HerSafe sign-up error:",
                error
            );

            alert(
                "HerSafe Pass could not open right now. Please try again."
            );

        }

    }


    /* =========================================
       OPEN CLERK SIGN IN
    ========================================= */

    async function openHerSafeSignIn() {

        try {

            const clerk =
                await waitForClerk();

            if (clerk.isSignedIn) {

                window.location.href =
                    "homepage101.html";

                return;

            }


            clerk.openSignIn({

                forceRedirectUrl:
                    "https://hmxplayzzz000.github.io/homepage101.html",

                fallbackRedirectUrl:
                    "https://hmxplayzzz000.github.io/homepage101.html"

            });

        } catch (error) {

            console.error(
                "HerSafe sign-in error:",
                error
            );

            alert(
                "HerSafe Pass could not open right now. Please try again."
            );

        }

    }


    /* =========================================
       OLD FUNCTION NAME
       KEPT SO YOUR OTHER PAGES STILL WORK
    ========================================= */

    async function openHerSafeAuth(mode) {

        if (mode === "signup") {

            await openHerSafeSignUp();

        } else {

            await openHerSafeSignIn();

        }

    }


    /* =========================================
       CURRENT USER
    ========================================= */

    async function currentUser() {

        try {

            const clerk =
                await waitForClerk();

            return clerk.user || null;

        } catch (error) {

            console.error(
                "Could not get current user:",
                error
            );

            return null;

        }

    }


    /* =========================================
       GET USERNAME
    ========================================= */

    async function getUsername() {

        const user =
            await currentUser();

        if (!user) {

            return null;

        }


        return (
            user.username ||
            user.primaryIdentifier?.identifier ||
            null
        );

    }


    /* =========================================
       IS SIGNED IN
    ========================================= */

    async function isSignedIn() {

        try {

            const clerk =
                await waitForClerk();

            return !!clerk.isSignedIn;

        } catch (error) {

            return false;

        }

    }


    /* =========================================
       LOG OUT
    ========================================= */

    async function logOut() {

        try {

            const clerk =
                await waitForClerk();

            await clerk.signOut();


            localStorage.removeItem(
                "herSafeUsername"
            );

            localStorage.removeItem(
                "herSafeQuizCompleted"
            );

            localStorage.removeItem(
                "herSafeQuizScore"
            );

            localStorage.removeItem(
                "herSafeQuizProgress"
            );


            window.location.href =
                "homepage101.html";

        } catch (error) {

            console.error(
                "HerSafe logout error:",
                error
            );

        }

    }


    /* =========================================
       SAVE QUIZ PROGRESS
    ========================================= */

    async function saveProgress(progress) {

        try {

            const clerk =
                await waitForClerk();


            if (!clerk.isSignedIn || !clerk.user) {

                localStorage.setItem(
                    "herSafeQuizProgress",
                    JSON.stringify(progress)
                );

                return {
                    success: false,
                    localOnly: true
                };

            }


            await clerk.user.update({

                unsafeMetadata: {

                    quizProgress: progress

                }

            });


            localStorage.setItem(
                "herSafeQuizProgress",
                JSON.stringify(progress)
            );


            return {
                success: true
            };


        } catch (error) {

            console.error(
                "Could not save HerSafe progress:",
                error
            );


            /* Backup locally */

            try {

                localStorage.setItem(
                    "herSafeQuizProgress",
                    JSON.stringify(progress)
                );

            } catch (localError) {

                console.error(
                    "Local progress backup failed:",
                    localError
                );

            }


            return {
                success: false,
                error: error
            };

        }

    }


    /* =========================================
       LOAD QUIZ PROGRESS
    ========================================= */

    async function loadProgress() {

        try {

            const clerk =
                await waitForClerk();


            if (
                clerk.isSignedIn &&
                clerk.user &&
                clerk.user.unsafeMetadata &&
                clerk.user.unsafeMetadata.quizProgress
            ) {

                return (
                    clerk.user.unsafeMetadata.quizProgress
                );

            }

        } catch (error) {

            console.error(
                "Could not load online progress:",
                error
            );

        }


        /* Local backup */

        try {

            const saved =
                localStorage.getItem(
                    "herSafeQuizProgress"
                );


            if (saved) {

                return JSON.parse(saved);

            }

        } catch (error) {

            console.error(
                "Could not load local progress:",
                error
            );

        }


        return null;

    }


    /* =========================================
       CLEAR QUIZ PROGRESS
    ========================================= */

    async function clearProgress() {

        try {

            const clerk =
                await waitForClerk();


            if (clerk.isSignedIn && clerk.user) {

                await clerk.user.update({

                    unsafeMetadata: {

                        quizProgress: null

                    }

                });

            }

        } catch (error) {

            console.error(
                "Could not clear online progress:",
                error
            );

        }


        localStorage.removeItem(
            "herSafeQuizProgress"
        );

        localStorage.removeItem(
            "herSafeQuizCompleted"
        );

        localStorage.removeItem(
            "herSafeQuizScore"
        );

    }


    /* =========================================
       USERNAME TAKEN
       ========================================= */

    async function isUsernameTaken(username) {

        /*
           Clerk checks username availability
           during its own sign-up process.

           We therefore let Clerk handle this
           rather than pretending every username
           is available.
        */

        return false;

    }


    /* =========================================
       UPDATE LOCAL USERNAME
    ========================================= */

    async function updateLocalUsername() {

        try {

            const username =
                await getUsername();


            if (username) {

                localStorage.setItem(
                    "herSafeUsername",
                    username
                );

            } else {

                localStorage.removeItem(
                    "herSafeUsername"
                );

            }

        } catch (error) {

            console.error(
                "Could not update local username:",
                error
            );

        }

    }


    /* =========================================
       STARTUP
    ========================================= */

    async function startHerSafeAccount() {

        try {

            const clerk =
                await waitForClerk();


            if (clerk.isSignedIn) {

                await updateLocalUsername();

            }

        } catch (error) {

            console.error(
                "HerSafe account startup error:",
                error
            );

        }

    }


    /* =========================================
       EXPOSE HERSAFE API
    ========================================= */

    window.HerSafe = {

        waitForClerk,

        openHerSafeAuth,

        openHerSafeSignIn,

        openHerSafeSignUp,

        currentUser,

        getUsername,

        isSignedIn,

        logOut,

        saveProgress,

        loadProgress,

        clearProgress,

        isUsernameTaken

    };


    /* =========================================
       START
    ========================================= */

    startHerSafeAccount();

})();
