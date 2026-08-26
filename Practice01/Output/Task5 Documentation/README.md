# Task 5: File Upload via Cloudinary and Firestore

## Overview

Task 5 extends the Staff Directory application by adding profile picture upload functionality.

Instead of using Firebase Storage, the application uses **Cloudinary** to store the actual profile images. The resulting Cloudinary image URL and public ID are saved in **Firestore** as part of the staff record.

This allows staff members to have profile pictures that can be displayed directly in the Staff Directory.

---

## Objectives

The main objectives of Task 5 are:

* Add a profile picture file input to the staff form.
* Upload selected profile pictures to Cloudinary.
* Retrieve the Cloudinary image URL after a successful upload.
* Save the image URL in the corresponding Firestore staff record.
* Display the profile picture inside the Staff Directory table.
* Allow existing staff profile pictures to be updated through the View Details dialog.
* Keep the profile picture display at a consistent size regardless of the original image dimensions.

---

## Technologies Used

* HTML
* CSS
* JavaScript
* AngularJS 1.x
* Firebase Firestore
* Cloudinary
* Angular Material
* SweetAlert2

---

## File Upload Flow

The profile picture upload follows this process:

```text
User selects an image
        ↓
AngularJS receives the selected file
        ↓
File is uploaded to Cloudinary
        ↓
Cloudinary returns secure_url and public_id
        ↓
URL and public ID are saved in Firestore
        ↓
Staff Directory retrieves the profile URL
        ↓
Profile picture is displayed in the table
```

---

## Cloudinary Configuration

The application uses a Cloudinary cloud name and unsigned upload preset.

```javascript
var cloudinaryCloudName = "zfoyzwjp";

var cloudinaryUploadPreset =
    "staff_profile_upload";
```

The Cloudinary Upload Widget/global script is included in the main HTML file:

```html
<script src="https://upload-widget.cloudinary.com/latest/global/all.js"></script>
```

The application also performs direct image uploads using the Cloudinary upload endpoint.

---

## Staff Record Structure

When a staff member is created, the staff object contains a `profileUrl` field.

```javascript
var newStaff = {

    id: staffId,

    name: name,

    role: role,

    status: "Inactive",

    profileUrl: ""

};
```

When an image is selected, the Cloudinary response provides the image URL and public ID.

```javascript
newStaff.profileUrl = data.secure_url;

newStaff.cloudinaryPublicId = data.public_id;
```

The resulting Firestore document can contain:

```text
id
name
role
status
profileUrl
cloudinaryPublicId
```

---

## Uploading a Profile Picture

The selected image is placed inside a `FormData` object:

```javascript
var formData = new FormData();

formData.append(
    "file",
    selectedProfileImage
);

formData.append(
    "upload_preset",
    cloudinaryUploadPreset
);
```

The application then sends the file to Cloudinary:

```javascript
fetch(uploadUrl, {

    method: "POST",

    body: formData

})
```

After a successful upload, Cloudinary returns information about the uploaded asset.

The application stores:

```javascript
newStaff.profileUrl = data.secure_url;

newStaff.cloudinaryPublicId = data.public_id;
```

---

## Saving the Image URL to Firestore

The profile picture itself is stored in Cloudinary.

Firestore stores the reference to the image:

```javascript
profileUrl: data.secure_url
```

This allows the application to retrieve the image URL whenever the staff record is loaded.

The structure is:

```text
Cloudinary
    ↓
Actual image file

Firestore
    ↓
Image URL + Cloudinary public ID
```

---

## Displaying the Profile Picture

The Staff Directory table displays the image using AngularJS:

```html
<img
    ng-if="staff.profileUrl"
    ng-src="{{ staff.profileUrl }}"
    alt="{{ staff.name }}"
    class="staff-avatar">
```

If the staff member does not have a profile picture, the application displays:

```html
<span ng-if="!staff.profileUrl">
    No Image
</span>
```

---

## Updating a Profile Picture

Existing staff members can update their profile picture through the **View Details** dialog.

The update process is:

```text
View Details
      ↓
Select new profile picture
      ↓
Upload new picture to Cloudinary
      ↓
Receive new secure_url and public_id
      ↓
Update Firestore
      ↓
Display the new profile picture
```

The View Details dialog also allows the staff member's:

* Full Name
* Role
* Profile Picture

to be updated.

---

## Image Display

Profile pictures are given a fixed display size using CSS so that different image dimensions do not affect the layout.

```css
.profile-preview {
    width: 140px;
    height: 140px;

    border-radius: 50%;
    overflow: hidden;
}

.profile-preview-image {
    width: 100%;
    height: 100%;

    object-fit: cover;
    object-position: center;
}
```

This keeps profile pictures consistent even when the uploaded images have different dimensions.

---

## Firestore and Cloudinary Relationship

The application separates image storage from staff data.

### Cloudinary

Stores:

* Actual profile image
* Image asset
* Cloudinary public ID

### Firestore

Stores:

* Staff ID
* Full Name
* Role
* Status
* Cloudinary image URL
* Cloudinary public ID

This allows the Staff Directory to retrieve the image through the URL saved in Firestore.

---

## Task 5 Requirements Checklist

* [x] Add profile picture file input.
* [x] Upload selected image to Cloudinary.
* [x] Retrieve the Cloudinary download URL.
* [x] Save the image URL inside the Firestore staff record.
* [x] Display profile pictures inside the Staff Directory table.
* [x] Allow profile pictures to be updated through View Details.
* [x] Keep profile picture dimensions consistent in the interface.
* [x] Store the Cloudinary public ID for the uploaded image.

### Note

Firebase Storage was not used for this implementation. Cloudinary was used as the external image storage service, while Firestore stores the image URL and Cloudinary public ID associated with each staff record.

---

## Result

Task 5 successfully extends the Staff Directory with profile picture functionality. Staff records can now have profile images uploaded to Cloudinary, referenced through Firestore, displayed in the Staff Directory, and updated through the View Details interface.

