// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import { getStorage, ref as storageRef, listAll, deleteObject } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCF6OCzcKwrDS4W3JEiBVnZeiw4ACS5qYk",
    authDomain: "fire-alarm-monitoring-sy-be36f.firebaseapp.com",
    databaseURL: "https://fire-alarm-monitoring-sy-be36f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fire-alarm-monitoring-sy-be36f",
    storageBucket: "fire-alarm-monitoring-sy-be36f.appspot.com",
    messagingSenderId: "238251501710",
    appId: "1:238251501710:web:22e10e60b945a4879201df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Function to initialize the settings
function initializeSettings() {
    const db = getDatabase(app);
    const adminProfileView = document.getElementById('adminProfileView');
    const adminProfileForm = document.getElementById('adminProfileForm');
    const editProfileButton = document.getElementById('editProfileButton');
    const cancelEditProfileButton = document.getElementById('cancelEditProfileButton');
    
    const changePasswordView = document.getElementById('changePasswordView');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const changePasswordButton = document.getElementById('changePasswordButton');
    const cancelChangePasswordButton = document.getElementById('cancelChangePasswordButton');

    // Load admin profile
    get(ref(db, 'Admin/Profile')).then((snapshot) => {
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            document.getElementById('viewAdminUsername').textContent = adminData.Username || '';
            document.getElementById('viewAdminEmail').textContent = adminData.Email || '';
            document.getElementById('viewAdminPhone').textContent = adminData.tel || '';

            document.getElementById('adminUsername').value = adminData.Username || '';
            document.getElementById('adminEmail').value = adminData.Email || '';
            document.getElementById('adminPhone').value = adminData.tel || '';
        }
    }).catch((error) => {
        console.error("Error fetching admin data: ", error);
    });

    // Toggle edit mode
    editProfileButton.addEventListener('click', () => {
        // Clear all input fields in the admin profile form
        adminProfileForm.querySelectorAll('input').forEach((input) => {
            input.value = '';
        });

        adminProfileView.style.display = 'none';
        adminProfileForm.style.display = 'block';
    });

    cancelEditProfileButton.addEventListener('click', () => {
        adminProfileView.style.display = 'block';
        adminProfileForm.style.display = 'none';
    });

    // Admin profile form submission
    adminProfileForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const email = document.getElementById('adminEmail').value;
        const phone = document.getElementById('adminPhone').value;

        // Get current admin profile data
        get(ref(db, 'Admin/Profile')).then((snapshot) => {
            if (snapshot.exists()) {
                const adminData = snapshot.val();
                // Update only the fields that are filled in by the user
                const updatedData = {
                    Username: username || adminData.Username, // If username is blank, retain the existing value
                    Email: email || adminData.Email, // If email is blank, retain the existing value
                    tel: phone || adminData.tel // If phone is blank, retain the existing value
                };

                // Update admin profile
                set(ref(db, 'Admin/Profile'), updatedData).then(() => {
                    document.getElementById('viewAdminUsername').textContent = updatedData.Username;
                    document.getElementById('viewAdminEmail').textContent = updatedData.Email;
                    document.getElementById('viewAdminPhone').textContent = updatedData.tel;

                    adminProfileView.style.display = 'block';
                    adminProfileForm.style.display = 'none';
                    alert('Admin profile updated successfully!');
                    // Clear input fields
                    document.getElementById('adminUsername').value = '';
                    document.getElementById('adminEmail').value = '';
                    document.getElementById('adminPhone').value = '';
                }).catch((error) => {
                    console.error("Error updating admin profile: ", error);
                });
            }
        }).catch((error) => {
            console.error("Error fetching admin data: ", error);
        });
    });

    // Cancel edit profile operation
    cancelEditProfileButton.addEventListener('click', () => {
        adminProfileView.style.display = 'block';
        adminProfileForm.style.display = 'none';
        // Clear input fields
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPhone').value = '';
    });

    // Toggle change password form
    changePasswordButton.addEventListener('click', () => {
        changePasswordView.style.display = 'none';
        changePasswordForm.style.display = 'block';
    });

    cancelChangePasswordButton.addEventListener('click', () => {
        changePasswordView.style.display = 'block';
        changePasswordForm.style.display = 'none';
    });

    // Change password form submission
    changePasswordForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match!');
            return;
        }

        get(ref(db, 'Admin/Security/Password')).then((snapshot) => {
            if (snapshot.exists() && snapshot.val() === currentPassword) {
                set(ref(db, 'Admin/Security/Password'), newPassword).then(() => {
                    alert('Password changed successfully!');
                    changePasswordView.style.display = 'block';
                    changePasswordForm.style.display = 'none';
                    // Clear input fields
                    document.getElementById('currentPassword').value = '';
                    newPasswordInput.value = '';
                    confirmPasswordInput.value = '';
                    // Reset password input type to password
                    newPasswordInput.type = 'password';
                    confirmPasswordInput.type = 'password';
                }).catch((error) => {
                    console.error("Error updating password: ", error);
                });
            } else {
                alert('Current password is incorrect!');
            }
        }).catch((error) => {
            console.error("Error verifying current password: ", error);
        });
    });

    // Toggle password visibility for current password
    document.getElementById('toggleCurrentPasswordVisibility').addEventListener('click', function () {
        const currentPasswordInput = document.getElementById('currentPassword');
        togglePasswordVisibility(currentPasswordInput);
    });

    // Toggle password visibility for new password
    document.getElementById('toggleNewPasswordVisibility').addEventListener('click', function () {
        const newPasswordInput = document.getElementById('newPassword');
        togglePasswordVisibility(newPasswordInput);
    });

    // Toggle password visibility for confirm password
    document.getElementById('toggleConfirmPasswordVisibility').addEventListener('click', function () {
        const confirmPasswordInput = document.getElementById('confirmPassword');
        togglePasswordVisibility(confirmPasswordInput);
    });

    // Function to toggle password visibility
    function togglePasswordVisibility(inputField) {
        if (inputField.type === 'password') {
            inputField.type = 'text';
        } else {
            inputField.type = 'password';
        }
    }

    // Cancel change password operation
    cancelChangePasswordButton.addEventListener('click', () => {
        changePasswordView.style.display = 'block';
        changePasswordForm.style.display = 'none';
        // Clear input fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    });
}

// Initialize settings when the page loads
document.addEventListener('DOMContentLoaded', initializeSettings);
