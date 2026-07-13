package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.response.PermissionResponse;
import com.sonabel.cmt.entity.Permission;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public List<PermissionResponse> findAll() {
        return permissionRepository.findAll().stream()
                .map(EntityMapper::toPermissionResponse)
                .toList();
    }

    public PermissionResponse findById(Long id) {
        return EntityMapper.toPermissionResponse(getById(id));
    }

    public Permission getById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission introuvable"));
    }
}
