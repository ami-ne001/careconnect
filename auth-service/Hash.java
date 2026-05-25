import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Hash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String seed = "$2a$10$CGF1GkrVYQHMn3vDEE0ioex8YE7HeGhVGMQ3RZ1Ez7X.zYeZlw9Su";
        System.out.println("admin123 matches seed: " + encoder.matches("admin123", seed));
        System.out.println("new hash for admin123: " + encoder.encode("admin123"));
    }
}
