package com.campus.rides.service;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

public interface FileStorageService {
    String storeFile(MultipartFile file, String subDir);
    Resource loadFileAsResource(String fileName, String subDir);
}
