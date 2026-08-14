const DEFAULT_DOMAINS = [
    "teamcapcut.my.id",
    "memberhead.biz.id",
    "lovecapcut.my.id",
    "19jutapekerjaan.my.id",
    "capcutnibos.my.id",
    "toolscapcut.my.id"
];

const ACCESS_CODE = "Flatimo0923";

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Particles
    if (window.particlesJS) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#00f3ff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.5, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#00f3ff", "opacity": 0.4, "width": 1 },
                "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }

    const loginScreen = document.getElementById("login-screen");
    const mainScreen = document.getElementById("main-screen");
    const accessInput = document.getElementById("access-code");
    const btnLogin = document.getElementById("btn-login");
    const loginError = document.getElementById("login-error");

    function checkAuth() {
        if (sessionStorage.getItem("auth_token") === ACCESS_CODE) {
            loginScreen.classList.add("hidden");
            mainScreen.classList.remove("hidden");
            initAdmin();
        } else {
            loginScreen.classList.remove("hidden");
            mainScreen.classList.add("hidden");
        }
    }

    btnLogin.addEventListener("click", () => {
        if (accessInput.value === ACCESS_CODE) {
            sessionStorage.setItem("auth_token", ACCESS_CODE);
            checkAuth();
        } else {
            loginError.style.display = "block";
            setTimeout(() => loginError.style.display = "none", 3000);
        }
    });

    accessInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btnLogin.click();
    });

    checkAuth();

    function initAdmin() {
        const domainList = document.getElementById("domain-list");
        const newDomainInput = document.getElementById("new-domain");
        const btnAdd = document.getElementById("btn-add");
        const btnReset = document.getElementById("btn-reset");

        function getDomains() {
            let d = JSON.parse(localStorage.getItem("tmail_domains"));
            if (!d || d.length === 0) {
                d = DEFAULT_DOMAINS;
                saveDomains(d);
            }
            return d;
        }

        function saveDomains(domains) {
            localStorage.setItem("tmail_domains", JSON.stringify(domains));
        }

        function renderDomains() {
            const domains = getDomains();
            domainList.innerHTML = "";
            
            domains.forEach((d, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="color: var(--text-bright)">@${d}</td>
                    <td>
                        <button class="btn-danger btn-delete" data-index="${index}">DELETE</button>
                    </td>
                `;
                domainList.appendChild(tr);
            });

            // Attach delete listeners
            document.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const idx = e.target.getAttribute("data-index");
                    let currentDomains = getDomains();
                    currentDomains.splice(idx, 1);
                    saveDomains(currentDomains);
                    renderDomains();
                });
            });
        }

        btnAdd.addEventListener("click", () => {
            const val = newDomainInput.value.trim().toLowerCase();
            if (!val) return;
            
            // basic domain validation regex
            const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
            if(!regex.test(val)){
                alert("INVALID DOMAIN FORMAT.");
                return;
            }

            let domains = getDomains();
            if (domains.includes(val)) {
                alert("DOMAIN ALREADY EXISTS.");
                return;
            }

            domains.push(val);
            saveDomains(domains);
            newDomainInput.value = "";
            renderDomains();
        });

        newDomainInput.addEventListener("keypress", (e) => {
            if(e.key === "Enter") btnAdd.click();
        });

        btnReset.addEventListener("click", () => {
            if(confirm("WARNING: RESET TO DEFAULT CONFIGURATION?")) {
                saveDomains(DEFAULT_DOMAINS);
                renderDomains();
            }
        });

        // Initial render
        renderDomains();
    }
});
