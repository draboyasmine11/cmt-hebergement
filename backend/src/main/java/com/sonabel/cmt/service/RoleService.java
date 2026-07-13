package com.sonabel.cmt.service;

import com.sonabel.cmt.dto.request.RoleRequest;
import com.sonabel.cmt.dto.response.RoleResponse;
import com.sonabel.cmt.entity.Permission;
import com.sonabel.cmt.entity.Role;
import com.sonabel.cmt.enums.RoleType;
import com.sonabel.cmt.exception.BusinessException;
import com.sonabel.cmt.exception.ResourceNotFoundException;
import com.sonabel.cmt.mapper.EntityMapper;
import com.sonabel.cmt.repository.RoleRepository;
import com.sonabel.cmt.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionService permissionService;
    private final UtilisateurRepository utilisateurRepository;

    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream()
                .map(this::enrichRoleResponse)
                .toList();
    }

    public RoleResponse findById(Long id) {
        return enrichRoleResponse(getById(id));
    }

    @Transactional
    public RoleResponse create(RoleRequest request) {
        if (request.getNom() == null || request.getNom().isBlank()) {
            throw new BusinessException("Le nom du rôle est obligatoire");
        }
        String nom = request.getNom().toUpperCase().trim();
        if (roleRepository.findByNom(RoleType.valueOf(nom)).isPresent()) {
            throw new BusinessException("Un rôle avec ce nom existe déjà");
        }

        Role role = Role.builder()
                .nom(RoleType.valueOf(nom))
                .description(request.getDescription())
                .actif(request.getActif() != null ? request.getActif() : true)
                .permissions(resolvePermissions(request.getPermissionIds()))
                .build();

        return enrichRoleResponse(roleRepository.save(role));
    }

    @Transactional
    public RoleResponse update(Long id, RoleRequest request) {
        Role role = getById(id);

        if (request.getNom() != null && !request.getNom().isBlank()) {
            role.setNom(RoleType.valueOf(request.getNom().toUpperCase().trim()));
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getActif() != null) {
            role.setActif(request.getActif());
        }
        if (request.getPermissionIds() != null) {
            role.setPermissions(resolvePermissions(request.getPermissionIds()));
        }

        return enrichRoleResponse(roleRepository.save(role));
    }

    @Transactional
    public void delete(Long id) {
        Role role = getById(id);
        long userCount = utilisateurRepository.countByRolesId(id);
        if (userCount > 0) {
            throw new BusinessException("Impossible de supprimer ce rôle : il est attribué à " + userCount + " utilisateur(s)");
        }
        roleRepository.delete(role);
    }

    public Role getById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable"));
    }

    private RoleResponse enrichRoleResponse(Role role) {
        long userCount = utilisateurRepository.countByRolesId(role.getId());
        return EntityMapper.toRoleResponse(role, userCount);
    }

    private Set<Permission> resolvePermissions(Set<Long> permissionIds) {
        if (permissionIds == null || permissionIds.isEmpty()) {
            return new HashSet<>();
        }
        Set<Permission> permissions = new HashSet<>();
        for (Long id : permissionIds) {
            permissions.add(permissionService.getById(id));
        }
        return permissions;
    }
}
