// script.js - review system using localStorage

// Keys
const STORAGE_KEY = "reviews_v1";

// DOM
const form = document.getElementById("reviewForm");
const usernameInput = document.getElementById("username");
const commentInput = document.getElementById("comment");
const reviewsList = document.getElementById("reviewsList");
const noReviewsText = document.getElementById("noReviews");
const clearBtn = document.getElementById("clearBtn");

// helper: load existing reviews from localStorage
function loadReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load reviews:", e);
    return [];
  }
}

// helper: save reviews array to localStorage
function saveReviews(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// format timestamp to readable string (local)
function formatTimestamp(ts) {
  const d = new Date(ts);
  // Example: Dec 6, 2025 — 6:14 PM
  return d.toLocaleString();
}

// render stars visually
function renderStars(rating) {
  let out = "";
  for (let i = 0; i < rating; i++) out += "★";
  return `<span class="stars" aria-hidden="true">${out}</span>`;
}

// render all reviews into the DOM
function renderReviews() {
  const reviews = loadReviews();
  reviewsList.innerHTML = "";
  if (!reviews.length) {
    noReviewsText.style.display = "block";
    return;
  } else {
    noReviewsText.style.display = "none";
  }

  // show newest first
  reviews.slice().reverse().forEach((r, idx) => {
    const card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("data-id", r.id || idx);

    card.innerHTML = `
      <div class="review-meta">
        <div>
          <div class="username">${escapeHtml(r.username)}</div>
          <div class="time">${formatTimestamp(r.time)}</div>
        </div>
        <div>${renderStars(r.rating)}</div>
      </div>
      <div class="comment-text">${escapeHtml(r.comment)}</div>
    `;
    reviewsList.appendChild(card);
  });
}

// simple escaping to avoid HTML injection
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// get selected rating from radio inputs
function getSelectedRating() {
  const radios = document.querySelectorAll('input[name="rating"]');
  for (const r of radios) {
    if (r.checked) return Number(r.value);
  }
  return 0;
}

// clear rating inputs
function clearRatingSelection() {
  const radios = document.querySelectorAll('input[name="rating"]');
  radios.forEach(r => (r.checked = false));
}

// submit handler
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const comment = commentInput.value.trim();
  const rating = getSelectedRating();

  // validations
  if (!username) {
    alert("Please enter a username.");
    usernameInput.focus();
    return;
  }
  if (!comment) {
    alert("Please write a comment.");
    commentInput.focus();
    return;
  }
  if (rating < 1 || rating > 5) {
    alert("Please select a rating.");
    return;
  }

  const reviews = loadReviews();

  const newReview = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    username,
    comment,
    rating,
    time: Date.now()
  };

  reviews.push(newReview);
  saveReviews(reviews);

  // reset form
  form.reset();
  clearRatingSelection();

  // re-render
  renderReviews();

  // announce to assistive tech users
  reviewsList.setAttribute("aria-live", "polite");
});

// clear all reviews button
clearBtn.addEventListener("click", function () {
  if (!confirm("Delete all reviews from this browser? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderReviews();
});

// initial render
renderReviews();
