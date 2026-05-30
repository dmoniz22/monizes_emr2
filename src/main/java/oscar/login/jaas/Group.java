package oscar.login.jaas;

import java.security.Principal;
import java.util.Enumeration;

/**
 * Replacement for java.security.acl.Group (removed in Java 17).
 * Represents a group of principals.
 */
public interface Group extends Principal {

    boolean addMember(Principal user);

    boolean removeMember(Principal user);

    boolean isMember(Principal member);

    Enumeration<? extends Principal> members();

}
