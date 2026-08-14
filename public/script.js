const DEFAULT_DOMAINS = [
    "teamcapcut.my.id",
    "memberhead.biz.id",
    "lovecapcut.my.id",
    "19jutapekerjaan.my.id",
    "capcutnibos.my.id",
    "toolscapcut.my.id"
];

const API_BASE = "https://flatimostore.biz.id";

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

    // --- MAIN APP LOGIC ---
    initApp();

    function initApp() {
        const domainSelect = document.getElementById("domain-select");
        const btnFetch = document.getElementById("btn-fetch");
        const resultsContainer = document.getElementById("results");
        const loader = document.getElementById("loader");
        const emailInput = document.getElementById("email-input");
        const btnFilterCapcut = document.getElementById("btn-filter-capcut");
        
        let isCapcutFilterActive = false;
        
        btnFilterCapcut.addEventListener("click", () => {
            isCapcutFilterActive = !isCapcutFilterActive;
            if (isCapcutFilterActive) {
                btnFilterCapcut.style.background = "var(--neon-cyan)";
                btnFilterCapcut.style.color = "black";
            } else {
                btnFilterCapcut.style.background = "transparent";
                btnFilterCapcut.style.color = "var(--neon-cyan)";
            }
        });

        // Load domains
        let domains = JSON.parse(localStorage.getItem("tmail_domains"));
        if (!domains || domains.length === 0) {
            domains = DEFAULT_DOMAINS;
            localStorage.setItem("tmail_domains", JSON.stringify(domains));
        }

        const modal = document.getElementById("custom-alert-modal");
        const modalMsg = document.getElementById("custom-alert-message");
        const modalClose = document.getElementById("custom-alert-close");

        function showError(msg) {
            modalMsg.textContent = msg;
            modal.classList.add("show");
        }

        modalClose.addEventListener("click", () => {
            modal.classList.remove("show");
        });

        // Fetch Logic
        btnFetch.addEventListener("click", async () => {
            const fullEmail = emailInput.value.trim().toLowerCase();

            if (!fullEmail) {
                showError("ERROR: INPUT CANNOT BE EMPTY.\nPLEASE ENTER AN EMAIL ADDRESS.");
                return;
            }

            if (!fullEmail.includes("@")) {
                showError("ERROR: INVALID FORMAT.\nMUST INCLUDE '@' (e.g. user@domain.com).");
                return;
            }

            const parts = fullEmail.split("@");
            const username = parts[0];
            const domain = parts[1];

            if (!username) {
                showError("ERROR: USERNAME CANNOT BE EMPTY.");
                return;
            }

            if (!domain) {
                showError("ERROR: DOMAIN CANNOT BE EMPTY.");
                return;
            }

            const fullAddress = `${username}@${domain}`;
            
            btnFetch.disabled = true;
            loader.style.display = "block";
            resultsContainer.style.display = "none";
            resultsContainer.innerHTML = "";

            try {
                // Gunakan URL relatif yang akan diarahkan ke server.js atau server asli jika di-hosting
                const baseUrl = "/api";
                
                const url = `${baseUrl}/inbox?address=${encodeURIComponent(fullAddress)}`;
                
                const response = await fetch(url);
                if (!response.ok) throw new Error("API Connection Failed");
                
                const responseData = await response.json(); 
                // Extract emails array from the response object
                const emails = responseData.emails || [];

                let filteredEmails = emails;
                if (isCapcutFilterActive) {
                    filteredEmails = emails.filter(e => {
                        const from = (e.from || e.sender || "").toLowerCase();
                        const subject = (e.subject || "").toLowerCase();
                        return from.includes("capcut") || subject.includes("capcut");
                    });
                }

                if (!filteredEmails || filteredEmails.length === 0) {
                    resultsContainer.innerHTML = "<p style='text-align:center; color: var(--neon-pink);'>NO DATA FOUND.</p>";
                } else {
                    filteredEmails.forEach((email, idx) => {
                        const item = document.createElement("div");
                        item.className = "email-item animate-in";
                        // Stagger effect for up to 4 elements
                        const delayClass = "delay-" + Math.min((idx + 1), 4);
                        item.classList.add(delayClass);
                        
                        // ID might be id or emailId depending on API struct
                        const emailId = email.id || email.emailId || email.uuid; 
                        const subjectText = email.subject || 'No Subject';
                        
                        // Coba ekstrak OTP 6 angka dari subject
                        const otpMatch = subjectText.match(/\b\d{6}\b/);
                        const otpDisplay = otpMatch ? `<div style="font-size: 1.5rem; color: var(--neon-cyan); margin-top: 10px; font-weight: bold; text-shadow: 0 0 5px var(--neon-cyan);">OTP: ${otpMatch[0]}</div>` : '';
                        
                        item.innerHTML = `
                            <div class="email-header">
                                <span class="email-sender">${email.from || email.sender || 'Unknown Sender'}</span>
                                <span class="email-date">${new Date(email.date || email.createdAt).toLocaleString()}</span>
                            </div>
                            <div class="email-subject">${subjectText}</div>
                            ${otpDisplay}
                            <div class="email-body" id="body-${emailId}">Loading content...</div>
                        `;

                        item.addEventListener("click", async () => {
                            const bodyContainer = item.querySelector('.email-body');
                            const isActive = bodyContainer.classList.contains("active");
                            
                            // Close all others
                            document.querySelectorAll('.email-body').forEach(b => b.classList.remove('active'));
                            
                            if (!isActive) {
                                bodyContainer.classList.add("active");
                                
                                // Fetch body if not already loaded (simple cache)
                                if (bodyContainer.textContent === "Loading content...") {
                                    try {
                                        const dlUrl = `${baseUrl}/download?address=${encodeURIComponent(fullAddress)}&emailId=${emailId}&type=email`;
                                        
                                        const res = await fetch(dlUrl);
                                        if(!res.ok) throw new Error();
                                        // Based on typical APIs, this might return JSON or raw HTML/Text
                                        const data = await res.text(); 
                                        
                                        // Attempt to parse JSON if it is JSON
                                        let bodyHtml = data;
                                        try {
                                            const jsonData = JSON.parse(data);
                                            bodyHtml = jsonData.body || jsonData.html || jsonData.text || data;
                                        } catch(e) {}
                                        
                                        // Jika OTP belum ketemu di subject, coba cari di body
                                        if (!otpMatch) {
                                            // Strip HTML tags for regex match
                                            const cleanText = bodyHtml.replace(/<[^>]*>?/gm, '');
                                            const bodyOtpMatch = cleanText.match(/\b\d{6}\b/);
                                            if (bodyOtpMatch) {
                                                const otpEl = document.createElement("div");
                                                otpEl.style.cssText = "font-size: 1.5rem; color: var(--neon-cyan); margin-top: 10px; margin-bottom: 10px; font-weight: bold; text-shadow: 0 0 5px var(--neon-cyan);";
                                                otpEl.innerText = `OTP: ${bodyOtpMatch[0]}`;
                                                bodyContainer.before(otpEl);
                                            }
                                        }
                                        
                                        bodyContainer.innerHTML = bodyHtml;
                                    } catch (err) {
                                        bodyContainer.innerHTML = "<span style='color:red;'>FAILED TO DECRYPT PAYLOAD.</span>";
                                    }
                                }
                            }
                        });

                        resultsContainer.appendChild(item);
                    });
                }
                
                resultsContainer.style.display = "block";
            } catch (error) {
                console.error(error);
                resultsContainer.innerHTML = "<p style='text-align:center; color: var(--neon-pink);'>ERROR ESTABLISHING CONNECTION.</p>";
                resultsContainer.style.display = "block";
            } finally {
                btnFetch.disabled = false;
                loader.style.display = "none";
            }
        });
    }
});

