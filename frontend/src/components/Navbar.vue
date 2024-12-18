<template>
    <nav>
        <ul>
            <li><strong>Wake up normies</strong></li>
        </ul>
        <ul>
            <li><RouterLink to="/articles">Go to Articles</RouterLink></li>
            <li><RouterLink to="/new-article">Go to post</RouterLink></li>
            <li>
            <details class="dropdown">
                <summary>
                Account
                </summary>
                <ul dir="rtl">
                    <li><RouterLink to="/">Go to my profil</RouterLink></li>
                    <li><RouterLink to="/logout">Logout</RouterLink></li>
                </ul>
            </details>
            </li>
        </ul>
    </nav>
</template>