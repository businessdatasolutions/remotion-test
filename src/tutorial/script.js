/**
 * Van Klassieke naar Organische Strategie
 * Interactive Tutorial Script
 */

document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initNavigationDots();
    initScrollAnimations();
    initFeedbackLoop();
    initQuiz();
    initSmoothScroll();
});

/**
 * Progress Bar
 * Shows reading progress at the top of the page
 */
function initProgressBar() {
    const progressBar = document.getElementById('progressBar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    });
}

/**
 * Navigation Dots
 * Updates active state based on current section
 */
function initNavigationDots() {
    const sections = document.querySelectorAll('.section');
    const navDots = document.querySelectorAll('.nav-dot');

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const sectionNumber = sectionId.replace('sectie', '');

                navDots.forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.dataset.section === sectionNumber) {
                        dot.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Scroll Animations
 * Triggers animations when sections come into view
 */
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Feedback Loop Animation
 * Interactive visualization of the complexity feedback loop
 */
function initFeedbackLoop() {
    const loopButton = document.getElementById('loopPlayBtn');
    const loopItems = document.querySelectorAll('.loop-item');
    let isPlaying = false;
    let currentStep = 0;
    let animationInterval;

    if (!loopButton) return;

    loopButton.addEventListener('click', () => {
        if (isPlaying) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    function startAnimation() {
        isPlaying = true;
        loopButton.innerHTML = '<span class="play-icon">⏹</span> Stop';
        currentStep = 0;

        // Immediately highlight first item
        highlightStep(currentStep);

        animationInterval = setInterval(() => {
            currentStep = (currentStep + 1) % loopItems.length;
            highlightStep(currentStep);
        }, 1500);
    }

    function stopAnimation() {
        isPlaying = false;
        loopButton.innerHTML = '<span class="play-icon">▶</span> Bekijk de Loop';
        clearInterval(animationInterval);
        loopItems.forEach(item => item.classList.remove('active'));
    }

    function highlightStep(step) {
        loopItems.forEach((item, index) => {
            if (index === step) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Allow clicking on loop items
    loopItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (!isPlaying) {
                loopItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });
}

/**
 * Quiz Functionality
 * Handles quiz interactions and scoring
 */
function initQuiz() {
    const quizQuestions = document.querySelectorAll('.quiz-question');
    const quizResult = document.getElementById('quizResult');
    let answeredQuestions = 0;
    let correctAnswers = 0;

    quizQuestions.forEach(question => {
        const options = question.querySelectorAll('.quiz-option');
        const feedback = question.querySelector('.quiz-feedback');
        let answered = false;

        options.forEach(option => {
            option.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                answeredQuestions++;

                const isCorrect = option.dataset.correct === 'true';

                // Disable all options for this question
                options.forEach(opt => {
                    opt.style.pointerEvents = 'none';
                    if (opt.dataset.correct === 'true') {
                        opt.classList.add('correct');
                    }
                });

                if (isCorrect) {
                    correctAnswers++;
                    option.classList.add('correct');
                    feedback.textContent = 'Correct! Goed gedaan.';
                    feedback.classList.add('correct');
                } else {
                    option.classList.add('incorrect');
                    feedback.textContent = 'Helaas, dat is niet het juiste antwoord.';
                    feedback.classList.add('incorrect');
                }

                feedback.classList.add('show');

                // Check if quiz is complete
                if (answeredQuestions === quizQuestions.length) {
                    showQuizResult();
                }
            });
        });
    });

    function showQuizResult() {
        const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
        let message = '';

        if (percentage === 100) {
            message = `Uitstekend! Je hebt alle ${quizQuestions.length} vragen goed beantwoord. Je begrijpt de concepten goed!`;
        } else if (percentage >= 66) {
            message = `Goed gedaan! Je hebt ${correctAnswers} van de ${quizQuestions.length} vragen goed. Je bent goed op weg!`;
        } else {
            message = `Je hebt ${correctAnswers} van de ${quizQuestions.length} vragen goed. Bekijk de tutorial nog eens om de concepten beter te begrijpen.`;
        }

        quizResult.innerHTML = `
            <strong>Resultaat: ${percentage}%</strong>
            <p>${message}</p>
        `;
        quizResult.classList.add('show');
    }
}

/**
 * Smooth Scroll
 * Handles smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Video Autoplay on Scroll
 * Pauses/plays videos based on visibility
 */
function initVideoAutoplay() {
    const videos = document.querySelectorAll('video');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Don't autoplay, just ensure controls are visible
                video.controls = true;
            } else {
                video.pause();
            }
        });
    }, observerOptions);

    videos.forEach(video => {
        observer.observe(video);
    });
}

// Initialize video handling
initVideoAutoplay();
