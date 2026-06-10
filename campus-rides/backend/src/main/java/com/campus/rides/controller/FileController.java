package com.campus.rides.controller;

import com.campus.rides.entity.User;
import com.campus.rides.service.FileStorageService;
import com.campus.rides.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Multipart File Upload API", description = "Endpoints for uploading user profile pictures and driver vehicle images.")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserService userService;

    @PostMapping(value = "/upload/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a profile picture", description = "Uploads a picture file using multipart/form-data and updates user settings.")
    public ResponseEntity<User> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String fileDownloadUri = fileStorageService.storeFile(file, "profiles");
        User updatedUser = userService.uploadProfilePicture(username, fileDownloadUri);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping(value = "/upload/vehicle-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Upload a vehicle image", description = "Uploads a vehicle picture file using multipart/form-data and updates vehicle details.")
    public ResponseEntity<User> uploadVehicleImage(@RequestParam("file") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String fileDownloadUri = fileStorageService.storeFile(file, "vehicles");
        User updatedUser = userService.uploadVehicleImage(username, fileDownloadUri);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping(value = "/upload/cnic-front", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Upload driver CNIC front image", description = "Uploads driver CNIC front image using multipart/form-data.")
    public ResponseEntity<User> uploadCnicFront(@RequestParam("file") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String fileDownloadUri = fileStorageService.storeFile(file, "cnics");
        User updatedUser = userService.uploadCnicFront(username, fileDownloadUri);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping(value = "/upload/cnic-back", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DRIVER')")
    @Operation(summary = "Upload driver CNIC back image", description = "Uploads driver CNIC back image using multipart/form-data.")
    public ResponseEntity<User> uploadCnicBack(@RequestParam("file") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String fileDownloadUri = fileStorageService.storeFile(file, "cnics");
        User updatedUser = userService.uploadCnicBack(username, fileDownloadUri);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{subDir}/{fileName:.+}")
    @Operation(summary = "Download a file", description = "Serves stored images or assets from the local filesystem with accurate MIME types.")
    public ResponseEntity<Resource> downloadFile(@PathVariable String subDir, @PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(fileName, subDir);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Keep content type null
        }

        // Fallback to default content type if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
