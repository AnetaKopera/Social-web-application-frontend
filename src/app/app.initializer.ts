import { AuthenticationService } from '../app/authentication.service'
import { CommunicationService } from '../app/communication.service'
import { UserService } from '../app/user.service'

export function appInitializer(authenticationService: AuthenticationService, communicationService: CommunicationService, userService: UserService) {
    return () => new Promise<void>(resolve => {
        authenticationService.checkIfTokenExist()
            .subscribe((res) => {
                if (res.userId != null && res.userId != undefined) {
                    authenticationService.userId = res.userId;
                    authenticationService.logedUser$.next(true);
                    communicationService.setUpAndGetData();
                    userService.getUserDetails(res.userId).subscribe((user) => {
                        authenticationService.user$ = user;
                    });

                    setTimeout(() => {
                        resolve();
                    }, 2000);
                } else {
                    resolve();
                }
            },
                (err) => {
                    console.log("error: ", err);
                })
    });
}
